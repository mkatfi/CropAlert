import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { ZoneDataModule } from './zone-data/zone-data.module';
import { ZoneData } from './zone-data/ZoneData.entity';
import { ZoneDataService } from './zone-data/zone-data.service';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // type: 'postgres', // process.env.
      // host: 'postgres_db', 
      // port: 5432,
      // username: 'postgres',
      // password: 'postgres',
      // database: 'mydatabase',
      // entities: [User, ZoneData],
      // synchronize: true, 

          type: process.env.DB_TYPE as 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [User, ZoneData],
        synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
        // logging: process.env.TYPEORM_LOGGING === 'true',
    }),
    UserModule,
    ZoneDataModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
