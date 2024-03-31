import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GroupModule } from './group/group.module';
import { ExpenseModule } from './expense/expense.module';
import { DebtModule } from './debt/debt.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GroupModule,
    ExpenseModule,
    DebtModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
