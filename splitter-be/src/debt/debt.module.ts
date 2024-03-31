import { Module } from '@nestjs/common';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';

@Module({
  controllers: [DebtController],
  providers: [DebtService],
})
export class DebtModule {}
