import { Injectable } from '@nestjs/common';
import { ExpenseCategory, Group, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddOrRemoveUserDTO, CreateGroupDto, UpdateGroupDTO } from './dto';
import { elementAt } from 'rxjs';

@Injectable()
export class GroupService {
  constructor(private prismaService: PrismaService) {}
  async create(createGroupDto: CreateGroupDto, user: User) {
    const connectUsers =
      createGroupDto.userIds.length > 0
        ? createGroupDto.userIds.map((userId) => ({ id: userId }))
        : { id: user.id };
    try {
      const group: Group = await this.prismaService.group.create({
        data: {
          name: createGroupDto.groupName,
          members: {
            connect: connectUsers,
          },
        },
      });
      return group;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    const groups: Group[] = await this.prismaService.group.findMany({
      include: {
        members: true,
      },

    });
    const filteredGroups = groups.map(group=>({
      id: group.id,
      groupName: group.name
    }))
    return filteredGroups;
  }

  async findAllByUserId(id: number) {
    const unfilteredGroups = await this.prismaService.group.findMany({
      where: {
        members: {
          some: {
            id,
          },
        },
      },
      include: {
        expenses: {
          include: {
            debts: {
              where: {
                userId: id,
              },
              select: {
                amount: true,
                currency2: true,
              },
            },
          },
        },
      },
    });

    const filteredGroups = unfilteredGroups.map((unfilteredGroup) => {
      const groupId = unfilteredGroup.id;
      const groupName = unfilteredGroup.name;

      const debtsMap = {};
      const debtsByCurrencies = [];

      //valutánként összegzi a tartozásokat
      unfilteredGroup.expenses.forEach((expense) => {
        expense.debts.forEach((debt) => {
          if (!debtsMap.hasOwnProperty(debt.currency2)) {
            debtsMap[debt.currency2] = 0;
          }
          debtsMap[debt.currency2] += debt.amount;
        });
      });

      //objektumba gyűjti
      for (const currency in debtsMap) {
        if (debtsMap.hasOwnProperty(currency)) {
          debtsByCurrencies.push({
            amount: debtsMap[currency],
            currency: currency,
          });
        }
      }

      return { groupId, groupName, debtsByCurrencies };
    });
    return filteredGroups;
  }

  async findOne(id: number) {
    const group = await this.prismaService.group.findUnique({
      where: {
        id,
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    const filteredGroup = {
      id: group.id,
      name: group.name,
      members: group.members,
    };
    return filteredGroup;
  }

  async getGroupDetails(id: number, userId: number) {
    const groupDetails = await this.prismaService.group.findUnique({
      where: {
        id: id,
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        expenses: {
          include: {
            payer: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
            debts: {
              where: {
                userId,
              },
              select: {
                amount: true,
                currency2: true,
              },
            },
          },
        },
      },
    });

    //-------------- bejelentkezett user mennyivel tartozik kinek ---------
    //minden groupmember összes expense a groupban, benne a bejelentkezett tartozása
    const expensesWithDebtsByUsers = await Promise.all(
      groupDetails.members.map(async (member) => {
        return await this.prismaService.expense.findMany({
          where: {
            payerId: member.id,
            groupId: id,
          },
          include: {
            debts: {
              where: {
                userId: userId,
              },
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
            payer: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });
      }),
    );

    //melyik groupMembernek mennyivel tartozom
    const iOweToMembers = expensesWithDebtsByUsers
      .map(
        //egy user kiadásai
        (expensesWithDebtsOfUser) => {
          let debtsOfUsers: {
            userId: number;
            username: string;
            sumDebtsByCurrencies: { sumAmount: number; currency: string }[];
          }[] = [];

          expensesWithDebtsOfUser.map(
            //egy user egy kiadása
            (expenseWithDebtsByUser) => {
              const debt = expenseWithDebtsByUser.debts[0];
              //csak egy lesz benne
              if (debt) {
                const index = debtsOfUsers.findIndex(
                  (debtsOfUser) =>
                    debtsOfUser.userId === expenseWithDebtsByUser.payerId,
                );
                if (index !== -1) {
                  const currencyIndex = debtsOfUsers[
                    index
                  ].sumDebtsByCurrencies.findIndex(
                    (subDebt) => subDebt.currency === debt.currency2,
                  );
                  if (currencyIndex !== -1) {
                    debtsOfUsers[index].sumDebtsByCurrencies[
                      currencyIndex
                    ].sumAmount += debt.amount;
                  } else {
                    debtsOfUsers[index].sumDebtsByCurrencies.push({
                      sumAmount: debt.amount,
                      currency: debt.currency2,
                    });
                  }
                } else {
                  debtsOfUsers.push({
                    userId: expenseWithDebtsByUser.payerId,
                    username: expenseWithDebtsByUser.payer.username,
                    sumDebtsByCurrencies: [
                      { sumAmount: debt.amount, currency: debt.currency2 },
                    ],
                  });
                }
              }
            },
          );

          return debtsOfUsers;
        },
      )
      .flat();

    //------------ melyik user mennyivel tartozik a bejelentkezett usernek ----------------
    const myExpensesInGroup = (
      await this.prismaService.expense.findMany({
        where: {
          payerId: userId,
          groupId: id,
        },
        include: {
          debts: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
      })
    ).map((myExpenseInGroup) => {
      return {
        id: myExpenseInGroup.id,
        expenseName: myExpenseInGroup.name,
        debts: myExpenseInGroup.debts.map((debt) => {
          return {
            userId: debt.user.id,
            username: debt.user.username,
            amount: debt.amount,
            currency: debt.currency2,
          };
        }),
      };
    });

    let membersOweMe: {
      userId: number;
      username: string;
      sumDebtsByCurrencies: { sumAmount: number; currency: string }[];
    }[] = [];

    //kiszámolom, melyik user mennyivel tartozik
    myExpensesInGroup.forEach((expense) => {
      expense.debts.forEach((debt) => {
        //benne van e már a tartozó a listában
        const index = membersOweMe.findIndex(
          (element) => element.userId === debt.userId,
        );

        if (index !== -1) {
          //benne van, megnézzük, van-e már ilyen devizában bejegyzés
          const currencyIndex = membersOweMe[
            index
          ].sumDebtsByCurrencies.findIndex(
            (memberDebt) => memberDebt.currency === debt.currency,
          );
          if (currencyIndex !== -1) {
            membersOweMe[index].sumDebtsByCurrencies[currencyIndex].sumAmount +=
              debt.amount;
          } else {
            membersOweMe[index].sumDebtsByCurrencies.push({
              sumAmount: debt.amount,
              currency: debt.currency,
            });
          }
        } else {
          membersOweMe.push({
            userId: debt.userId,
            username: debt.username,
            sumDebtsByCurrencies: [
              { sumAmount: debt.amount, currency: debt.currency },
            ],
          });
        }
      });
    });

    //az én tartozásaim mindegyikét kivonom abból amennyivel nekem tartoznak
    iOweToMembers.forEach((iOweToMember) => {
      //tartozik-e nekem az, akinek én tartozom?
      const index = membersOweMe.findIndex((memberOwesMe) => {
        console.log('memberOwesMe userName?ó:', memberOwesMe.username);
        console.log('memberOwesMe userName?ó:', iOweToMember.username);

        return memberOwesMe.userId === iOweToMember.userId;
      });
      console.log('index: ', index);

      if (index !== -1) {
        iOweToMember.sumDebtsByCurrencies.forEach((mySumDebt) => {
          const currencyIndex = membersOweMe[
            index
          ].sumDebtsByCurrencies.findIndex(
            (memberSumDebt) => memberSumDebt.currency === mySumDebt.currency,
          );
          if (currencyIndex !== -1) {
            membersOweMe[index].sumDebtsByCurrencies[currencyIndex].sumAmount -=
              mySumDebt.sumAmount;
            if (
              membersOweMe[index].sumDebtsByCurrencies[currencyIndex]
                .sumAmount === 0
            ) {
              membersOweMe[index].sumDebtsByCurrencies.splice(currencyIndex, 1);
            }
          } else {
            membersOweMe[index].sumDebtsByCurrencies.push({
              sumAmount: -mySumDebt.sumAmount,
              currency: mySumDebt.currency,
            });
          }
        });
      } else {
        membersOweMe.push({
          userId: iOweToMember.userId,
          username: iOweToMember.username,
          sumDebtsByCurrencies: iOweToMember.sumDebtsByCurrencies.map(
            (debt) => ({ sumAmount: -debt.sumAmount, currency: debt.currency }),
          ),
        });
      }
    });

    const filteredExpenses = groupDetails.expenses.map((expense) => {
      let payerName;
      if (expense.payer.firstName && expense.payer.lastName) {
        payerName = expense.payer.firstName + ' ' + expense.payer.lastName;
      } else {
        payerName = expense.payer.username;
      }
      let isUserInvolved: boolean = false;
      let debtAmount = 0;
      if (expense.debts.length > 0) {
        isUserInvolved = true;
        expense.debts.forEach((debt) => {
          debtAmount = debt.amount;
        });
      } else {
        debtAmount = null;
      }
      return {
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        distribution: expense.distribution,
        debtAmount,
        payerName,
      };
    });

    return {
      id: groupDetails.id,
      name: groupDetails.name,
      members: groupDetails.members,
      expenses: filteredExpenses,
      balanceOfUser: membersOweMe,
    };
  }

  async findMembersByGroupId(id: number) {
    try {
      const group = await this.prismaService.group.findUnique({
        where: {
          id,
        },
        include: {
          members: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
      return group.members;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateGroupDto: UpdateGroupDTO) {
    console.log("in update group");
    
    try {
      let group: Group = await this.prismaService.group.update({
        where: {
          id: id,
        },
        data: {
          name: updateGroupDto.groupName,
        },
      });

      console.log(updateGroupDto);
      console.log(group);
      

      if (updateGroupDto.userIds.length > 0) {
        group = await this.prismaService.group.update({
          where: {
            id: id,
          },
          data: {
            members: {
              connect: updateGroupDto.userIds.map((userId) => ({ id: userId })),
            },
          },
        });
      }

      return group;
    } catch (error) {
      throw error;
    }
  }

  async addUser(id: number, addUserDto: AddOrRemoveUserDTO) {
    try {
      const group: Group = await this.prismaService.group.update({
        where: {
          id: id,
        },
        data: {
          updatedAt: new Date(),
          members: {
            connect: {
              username: addUserDto.username,
            },
          },
        },
      });
      return await this.prismaService.group.findUnique({
        where: {
          id: id,
        },
        include: {
          members: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async removeUser(id: number, addUserDto: AddOrRemoveUserDTO) {
    try {
      const group: Group = await this.prismaService.group.update({
        where: {
          id: id,
        },
        data: {
          updatedAt: new Date(),
          members: {
            disconnect: {
              username: addUserDto.username,
            },
          },
        },
      });
      return await this.prismaService.group.findUnique({
        where: {
          id: id,
        },
        include: {
          members: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    await this.prismaService.$transaction(async (prisma) => {
      const expenses = await prisma.expense.findMany({
        where: {
          groupId: id,
        },
        select: {
          id: true,
        },
      });

      for (const expense of expenses) {
        await prisma.debt.deleteMany({
          where: {
            expenseId: expense.id,
          },
        });
      }

      await prisma.expense.deleteMany({
        where: {
          groupId: id,
        },
      });

      await prisma.group.delete({
        where: {
          id: id,
        },
      });
    });
    return {
      group: id,
      message: 'this group was deleted:',
    };
  }
}
