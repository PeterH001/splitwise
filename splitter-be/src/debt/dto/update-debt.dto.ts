import { PartialType } from '@nestjs/mapped-types';
import { CreateDebtDTO } from './create-debt.dto';

export class UpdateDebtDTO extends PartialType(CreateDebtDTO) {}
