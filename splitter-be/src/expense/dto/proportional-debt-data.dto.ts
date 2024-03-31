import { IsNotEmpty, IsNumber, IsPositive, Max, Min } from "class-validator"

export class ProportionalDebtDataDTO {
    @IsNotEmpty()
    @IsNumber()
    userId: number

    @IsNotEmpty()
    @IsNumber()
    @Max(100)
    @Min(0)
    @IsPositive()
    percent: number
}