import { Test, TestingModule } from '@nestjs/testing';
import { ZoneDataService } from './zone-data.service';

describe('ZoneDataService', () => {
  let service: ZoneDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZoneDataService],
    }).compile();

    service = module.get<ZoneDataService>(ZoneDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
