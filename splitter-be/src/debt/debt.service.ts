import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDebtDTO } from './dto/create-debt.dto';
import { UpdateDebtDTO } from './dto/update-debt.dto';
import { Debt } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class DebtService {
  constructor(private prismaService: PrismaService) {}
  async create(createDebtDto: CreateDebtDTO) {
    try {
      const debt: Debt = await this.prismaService.debt.create({
        data: {
          amount: createDebtDto.amount,
          currency2: createDebtDto.currency,
          expense: {
            connect: { id: createDebtDto.expenseId },
          },
          user: {
            connect: { id: createDebtDto.debtorId },
          },
        },
      });
      return debt;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }

  async findAll() {
    try {
      const debts: Debt[] = await this.prismaService.debt.findMany();
      return debts;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }
  async findAllByUserId(userId: number) { 
    try {
      const debts = await this.prismaService.debt.findMany({
        where:{
          userId
        },
        include:{
          expense:{
            select:{
              id: true,
              name: true,
              currency: true,
              payer:{
                select:{
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true
                }
              },
              group:{
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });
      const filteredDebts = debts.map(debt=>{
        const payerName = debt.expense.payer.firstName && debt.expense.payer.lastName ? debt.expense.payer.firstName + ' ' + debt.expense.payer.lastName : debt.expense.payer.username
        return {
          userId: debt.userId,
          amount: debt.amount,
          currency: debt.expense.currency,
          payerId: debt.expense.payer.id,
          payerName,
          groupId: debt.expense.group.id,
          groupName: debt.expense.group.name,
          expenseId: debt.expense.id,
          expenseName: debt.expense.name
        }
      })
      return filteredDebts;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const debt: Debt = await this.prismaService.debt.findUnique({
        where: {
          id: id,
        },
      });
      return debt;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }

  async update(id: number, updateDebtDTO: UpdateDebtDTO) {
    try {
      const debt: Debt = await this.prismaService.debt.update({
        where: {
          id,
        },
        data: updateDebtDTO,
      });
      return debt;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const debt: Debt = await this.prismaService.debt.delete({
        where: {
          id: id,
        },
      });
      return debt;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.code + error.message);
      }
      throw error;
    }
  }
}
