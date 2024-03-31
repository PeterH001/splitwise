import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto as CreateGroupDTO } from './create-group.dto';
import { IsString } from 'class-validator';

export class UpdateGroupDTO extends PartialType(CreateGroupDTO) {
  @IsString()
  groupName: string;
}
