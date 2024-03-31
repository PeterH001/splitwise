import { IsNotEmpty, IsString } from "class-validator";

export class FindUserDTO{
    @IsNotEmpty()
    @IsString()
    partialUsername: string
}