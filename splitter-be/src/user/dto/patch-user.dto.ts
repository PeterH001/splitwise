import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class PatchUserDTO{
    @IsString()
    @IsNotEmpty()
    username: string
    
    @IsString()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsOptional()
    firstName?: string
    
    @IsString()
    @IsOptional()
    lastName?: string
}