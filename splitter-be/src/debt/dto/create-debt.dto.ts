import { Currency } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class CreateDebtDTO {
  @IsNotEmpty()
  @IsInt()
  expenseId: number;

  @IsNotEmpty()
  @IsInt()
  debtorId: number;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

}
