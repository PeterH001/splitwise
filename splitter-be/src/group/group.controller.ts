import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDTO } from './dto/update-group.dto';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { AddOrRemoveUserDTO } from './dto/add-or-remove-user.dto';

@UseGuards(JwtGuard)
@UseGuards(RolesGuard)
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @GetUser() user: User) {
    console.log("createGroupDto: ", createGroupDto);
    
    return this.groupService.create(createGroupDto, user);
  }

  @Get()
  findAll() {
    return this.groupService.findAll();
  }

  @Get('mygroups')
  findAllByUserId(@GetUser() user: User) {
    return this.groupService.findAllByUserId(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @Get(':id/details')
  getGroupDetails(@Param('id') id: string, @GetUser() user: User) {
    return this.groupService.getGroupDetails(+id, user.id);
  }

  @Get(':id/members')
  findMembersByGroupId(@Param('id') id: string) {
    return this.groupService.findMembersByGroupId(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDTO) {
    return this.groupService.update(+id, updateGroupDto);
  }

  @Patch(':id/adduser')
  addUser(@Param('id') id: string, @Body() addUserDto: AddOrRemoveUserDTO) {
    return this.groupService.addUser(+id, addUserDto);
  }

  @Patch(':id/removeuser')
  removeUser(@Param('id') id: string, @Body() addUserDto: AddOrRemoveUserDTO) {
    return this.groupService.removeUser(+id, addUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(+id);
  }
}
