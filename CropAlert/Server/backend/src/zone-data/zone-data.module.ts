import { Module } from '@nestjs/common';
import { ZoneDataService } from './zone-data.service';
import { ZoneDataController } from './zone-data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZoneData } from './ZoneData.entity';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ZoneData, User])],
  providers: [ZoneDataService],
  controllers: [ZoneDataController],
  exports: [ZoneDataService]
})
export class ZoneDataModule {}
