import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class ExactAmountsDebtDataDTO {
  userId: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsPositive()
  amount: number;
}
