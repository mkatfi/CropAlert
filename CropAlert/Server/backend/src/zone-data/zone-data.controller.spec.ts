import { Test, TestingModule } from '@nestjs/testing';
import { ZoneDataController } from './zone-data.controller';

describe('ZoneDataController', () => {
  let controller: ZoneDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZoneDataController],
    }).compile();

    controller = module.get<ZoneDataController>(ZoneDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
