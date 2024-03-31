import { User } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  isArray,
} from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  groupName: string;

  @IsOptional()
  @IsArray()
  userIds?: number[];
}
