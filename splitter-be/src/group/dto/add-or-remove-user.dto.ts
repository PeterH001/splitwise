import { IsNotEmpty, IsString,  } from "class-validator";

export class AddOrRemoveUserDTO {
    @IsNotEmpty()
    @IsString()
    username: string
}