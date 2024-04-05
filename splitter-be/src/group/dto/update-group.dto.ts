import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto as CreateGroupDTO } from './create-group.dto';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateGroupDTO extends PartialType(CreateGroupDTO) {
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @IsOptional()
  @IsArray()
  userIds?: number[];
}
