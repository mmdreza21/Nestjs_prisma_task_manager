import { Test, TestingModule } from '@nestjs/testing';
import { McController } from './mc.controller';
import { McService } from './mc.service';

describe('McController', () => {
  let controller: McController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [McController],
      providers: [McService],
    }).compile();

    controller = module.get<McController>(McController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
