import { Test, TestingModule } from '@nestjs/testing';
import { DebtService } from './debt.service';

describe('DebtService', () => {
  let service: DebtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DebtService],
    }).compile();

    service = module.get<DebtService>(DebtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
