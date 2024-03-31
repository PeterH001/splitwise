import { Injectable } from '@nestjs/common';
import { ExpenseCategory, Group, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddOrRemoveUserDTO, CreateGroupDto, UpdateGroupDTO } from './dto';

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

    return groups;
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
      console.log('debtsMap:', debtsMap);

      //objektumba gyűjti
      for (const currency in debtsMap) {
        if (debtsMap.hasOwnProperty(currency)) {
          debtsByCurrencies.push({
            amount: debtsMap[currency],
            currency: currency,
          });
        }
      }
      console.log('debtsByCurrencies: ', debtsByCurrencies);

      return { groupId, groupName, debtsByCurrencies };
    });
    return filteredGroups;
  }

  async findOne(id: number) {
    return await this.prismaService.group.findUnique({
      where: {
        id,
      },
    });
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
        isUserInvolved,
      };
    });

    return {
      id: groupDetails.id,
      name: groupDetails.name,
      members: groupDetails.members,
      expenses: filteredExpenses,
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
    try {
      const group: Group = await this.prismaService.group.update({
        where: {
          id: id,
        },
        data: {
          name: updateGroupDto.groupName,
        },
      });
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
    const group: Group = await this.prismaService.group.delete({
      where: {
        id: id,
      },
    });
    return {
      message: 'this group was deleted:',
      group,
    };
  }
}
