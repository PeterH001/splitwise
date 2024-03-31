import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDTO, SignupDTO } from './dto';
import { RolesGuard } from './guard';

@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: SignupDTO) {
    return this.authService.signup(dto);
  }
  
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: SigninDTO) {
    return this.authService.login(dto);
  }
}
