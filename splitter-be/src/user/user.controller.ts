import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard';
import { UserService } from './user.service';
import { FindUserDTO, PatchUserDTO } from './dto';

//TODO: User CRUD
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    return this.userService.getMe(user);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // azért post és body, nem pedig get és param, mert ha csak stringet kap a contains, valamiért _ref: String is missing errort kapok
  @Post('find')
  // findUsersByUsernamePartial(@Body() dto: FindUserDTO) {
  findUsersByUsernamePartial(@Body() dto: FindUserDTO) {    
    return this.userService.findUsersByUsernamePartial(dto);
  }

  @Patch('me')
  patchMe(@GetUser() user: User, @Body() dto: PatchUserDTO) {
    return this.userService.patchMe(user.id, dto);
  }
}
