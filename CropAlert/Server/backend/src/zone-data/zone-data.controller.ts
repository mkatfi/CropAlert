import { Body, Controller, Param, Post, Req, Patch, Get, UseGuards, Delete } from '@nestjs/common';
import { Request } from 'express';
import { ZoneDataService } from './zone-data.service';
import { CreateZoneDto } from './zone-data.dto';
import { UpdateZoneDto } from './update-zone-data.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ZoneData')
export class ZoneDataController {
    constructor(private readonly zoneDataService: ZoneDataService) {}

    @Post('/create')
    createZoneData(
        @Body() createZoneDataDto: CreateZoneDto,
    ) {
        console.log('Creating zone with data:', createZoneDataDto);
        return this.zoneDataService.createZone(createZoneDataDto);
    }
      
    @Patch('/update/:id')
    @UseGuards(JwtAuthGuard)
        async updateZone(
        @Param('id') id: number,
        @Body() updateZoneDto: UpdateZoneDto,
        @Req() req: Request,
    ) {
    return this.zoneDataService.updateZone(Number(id), updateZoneDto, (req as any).user);
  }
    
  @Get()
  async getAllZones() {
    return this.zoneDataService.getAllZones()
  }
  
  @Get(':id')
  async getZoneById(@Param('id') id: number) {
    return this.zoneDataService.getZoneById(Number(id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteZone(@Param('id') id: number, @Req() req: Request) {
    return this.zoneDataService.deleteZone(Number(id), (req as any).user);
  }
}
