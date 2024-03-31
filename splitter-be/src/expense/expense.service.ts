import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateExpenseDTO,
  ProportionalDebtDataDTO,
  UpdateExpenseDTO,
} from './dto';
import { Distribution, Expense, ExpenseCategory } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

//TODO: létrehozni a debteket az elosztás módjának megfelelően
@Injectable()
export class ExpenseService {
  constructor(private prismaService: PrismaService) {}

  async create(dto: CreateExpenseDTO) {
    try {
      let createDebtsData = [];
      if (dto.distributionType && dto.distributionType === Distribution.exact_amounts) {
        dto.exactAmountsDebtData.map((data) => {
          createDebtsData.push({
            userId: data.payerId,
            amount: data.exactAmount,
            currency: dto.currency,
          });
        });
      } else if (
        dto.distributionType &&
        dto.distributionType === Distribution.proportional
      ) {
        dto.proportionalDebtsData.map((data: ProportionalDebtDataDTO) => {
          createDebtsData.push({
            userId: data.userId,
            amount: (dto.amount * data.percent) / 100,
            currency: dto.currency,
          });
        });
      } else {
        dto.userIds.map((userId) => {
          createDebtsData.push({
            userId,
            amount: dto.amount / dto.userIds.length,
            currency: dto.currency,
          });
        });
      }
      const isEqual= isSumEqualToValue(
        createDebtsData.map((data) => data.amount),
        dto.amount,
      )
      if (!isEqual) { 
        throw new Error('Sum of debt amounts and the amount of expense differ');
      }

      const expense = await this.prismaService.expense.create({
        data: {
          name: dto.name,
          amount: dto.amount,
          currency: dto.currency,
          category: dto.category,
          distribution: dto.distributionType,
          description: dto.description,
          payer: {
            connect: {
              id: dto.payerId,
            },
          },
          group: {
            connect: {
              id: dto.groupId,
            },
          },
          debts: {
            createMany: {
              data: createDebtsData.map((debt) => ({
                amount: debt.amount,
                currency2: debt.currency,
                userId: debt.userId,
              })),
            },
          },
        },
        include: {
          debts: true,
        },
      });
      return expense;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }

  async findAll() {
    try {
      const expenses: Expense[] = await this.prismaService.expense.findMany();
      return expenses;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }

  async findAllByGroupId(id: string) {
    try {
      const expenses: Expense[] = await this.prismaService.expense.findMany({
        where: {
          groupId: parseInt(id),
        },
      });
      return expenses;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }

  async findAllByUserId(id: string) {
    try {
      const expenses: Expense[] = await this.prismaService.expense.findMany({
        where: {
          payerId: parseInt(id),
        },
      });
      return expenses;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }

  async findMyExpenses(id: number) {
    try {
      const expenses = await this.prismaService.expense.findMany({
        where: {
          payerId: id,
        },
        include:{
          group:{
            select:{
              name: true,
              id: true
            }
          }
        }
      });

      const filteredExpenses = expenses.map(expense=>{
        return {
          id: expense.id,
          amount: expense.amount,
          currency: expense.currency,
          distributionType: expense.distribution,
          group: {
            id: expense.group.id,
            name: expense.group.name
          }
        }
      })
      return filteredExpenses;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const expense = await this.prismaService.expense.findUnique({
        where: {
          id: id,
        },
        include: {
          debts: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          payer: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      const payerName =
        expense.payer.firstName && expense.payer.lastName
          ? expense.payer.firstName + ' ' + expense.payer.lastName
          : expense.payer.username;
      const filteredDebts = expense.debts.map((unfilteredDebt) => {
        let name =
          unfilteredDebt.user.firstName && unfilteredDebt.user.lastName
            ? unfilteredDebt.user.firstName + ' ' + unfilteredDebt.user.lastName
            : unfilteredDebt.user.username;

        return {
          amount: unfilteredDebt.amount,
          currency: unfilteredDebt.currency2,
          expenseId: unfilteredDebt.expenseId,
          name,
        };
      });
      return {
        amount: expense.amount,
        category: expense.category,
        currency: expense.currency,
        description: expense.description,
        expenseName: expense.name,
        id: expense.id,
        debts: filteredDebts,
        payerId: expense.payer.id,
        payerName,
        distribution: expense.distribution,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }

  async update(id: number, updateExpenseDTO: UpdateExpenseDTO) {
    try {
      const expense: Expense = await this.prismaService.expense.update({
        where: {
          id,
        },
        data: updateExpenseDTO,
      });
      return expense;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const expense: Expense = await this.prismaService.expense.delete({
        where: {
          id: id,
        },
      });
      return expense;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }

  async getExpenseCategories() {
    try {
      const categories = await this.prismaService.$queryRaw`SELECT enum_range(NULL::"ExpenseCategory") AS categories`;
      
      return categories[0].categories;
    } catch (error) {
      // Handle errors appropriately
      console.error('Error fetching category values:', error); 
      throw error;
    }
  }

  async getExpenseDistributions() {
    try {
      const distributionTypes = await this.prismaService.$queryRaw`SELECT enum_range(NULL::"Distribution") AS distributiontypes`;
      
      return distributionTypes[0].distributiontypes;
    } catch (error) {
      // Handle errors appropriately
      console.error('Error fetching category values:', error); 
      throw error;
    }
  }

  async getCurrencies() {
    try {
      const currencies = await this.prismaService.$queryRaw`SELECT enum_range(NULL::"Currency") AS currencies`;
      console.log(currencies);
      
      return currencies[0].currencies;
    } catch (error) {
      // Handle errors appropriately
      console.error('Error fetching category values:', error); 
      throw error;
    }
  }
}

function isSumEqualToValue(array: number[], targetSum: number): boolean {
  let sum = 0;
  for (const num of array) {
    sum += num;
    if (sum > targetSum) {
      return false;
    }
  }
  console.log("targetSum:", targetSum); 
  console.log("Sum:", sum);
  const result = sum === targetSum;
  console.log("result:", result);
  return result;
}
