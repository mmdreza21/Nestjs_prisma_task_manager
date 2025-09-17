import { Test, TestingModule } from '@nestjs/testing';
import { McService } from './mc.service';

describe('McService', () => {
  let service: McService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [McService],
    }).compile();

    service = module.get<McService>(McService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
