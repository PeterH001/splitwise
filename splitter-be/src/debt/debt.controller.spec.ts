import { Test, TestingModule } from '@nestjs/testing';
import { DebtController } from './debt.controller';
import { DebtService } from './debt.service';

describe('DebtController', () => {
  let controller: DebtController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DebtController],
      providers: [DebtService],
    }).compile();

    controller = module.get<DebtController>(DebtController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
