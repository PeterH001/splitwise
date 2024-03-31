import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDTO } from './create-expense.dto';

export class UpdateExpenseDTO extends PartialType(CreateExpenseDTO) {}
