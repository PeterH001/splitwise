import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigninDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
