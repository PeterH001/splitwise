import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { Currency, Distribution, ExpenseCategory } from '@prisma/client';
import { ExactAmountsDebtDataDTO } from './exact-amount-debt-data.dto';
import { ProportionalDebtDataDTO } from './proportional-debt-data.dto';

export class CreateExpenseDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  payerId: number;

  @IsNotEmpty()
  @IsNumber()
  groupId: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @IsOptional()
  @IsEnum(Distribution)
  distributionType?: Distribution;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber({}, { each: true })
  userIds: number[];

  @IsOptional()
  @Validate((value: any) => {
    if (!(value instanceof ExactAmountsDebtDataDTO)) {
      throw new Error('Value must be instance of ExactAmountsDebtDataDTO');
    }
  })
  exactAmountsDebtData: ExactAmountsDebtDataDTO[];

  @IsOptional()
  @Validate((value: any) => {
    if (!(value instanceof ProportionalDebtDataDTO)) {
      throw new Error('Value must be instance of ProportionalDebtDataDTO');
    }
  })
  proportionalDebtsData: ProportionalDebtDataDTO[];
}
