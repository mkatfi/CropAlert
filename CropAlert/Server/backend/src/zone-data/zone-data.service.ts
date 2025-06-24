import { Injectable } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UpdateZoneDto } from './update-zone-data.dto';
import { CreateZoneDto } from './zone-data.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZoneData } from './ZoneData.entity';

@Injectable()
export class ZoneDataService {
constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ZoneData)
    private zoneRepository: Repository<ZoneData>,
  ) {}


async createZone(createDto: CreateZoneDto) {
  try {
    const user = await this.userRepository.findOne({ where: { id: createDto.userId } });
    if (!user || user.role !== 'farmer') {
      throw new Error('Only farmers can create zones');
    }
    const zone = this.zoneRepository.create({
      latitude: createDto.latitude,
      longitude: createDto.longitude,
      user,
    });
    return this.zoneRepository.save(zone);
} catch (error) {
  console.error('Error creating zone:', error);
  throw new Error('Failed to create zone');
  }
}

  async updateZone(id: number, updateDto: UpdateZoneDto, updater: User) {
  try {
    const zone = await this.zoneRepository.findOne({ where: { id }, relations: ['user'] });
    if (!zone) throw new Error('Zone not found');

    if (updater.role !== 'agronomist') {
      throw new Error('Only agronomists are allowed to update zone data.');
    }

    zone.title = updateDto.title ?? zone.title;
    zone.description = updateDto.description ?? zone.description;
    zone.status = updateDto.status ?? zone.status;

    return this.zoneRepository.save(zone);
  } catch (error) {
    console.error('Error updating zone:', error);
    throw new Error('Failed to update zone');
  }
}

 async getAllZones() {
    return this.zoneRepository.find({
      relations: ["user"],
      select: {
        user: {
          id: true,
          name: true,
          role: true,
        },
      },
    })
  }

  async getZoneById(id: number) {
    const zone = await this.zoneRepository.findOne({
      where: { id },
      relations: ["user"],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    });

    if (!zone) {
      throw new Error('Zone not found');
    }

    return zone;
  }

  async deleteZone(id: number, user: User) {
    try {
      const zone = await this.zoneRepository.findOne({ where: { id }, relations: ['user'] });
      if (!zone) {
        throw new Error('Zone not found');
      }

      // Only agronomists can delete zones, or the owner farmer can delete their own zone
      if (user.role !== 'agronomist' && zone.user.id !== user.id) {
        throw new Error('You are not authorized to delete this zone');
      }

      await this.zoneRepository.remove(zone);
      return { message: 'Zone deleted successfully', id };
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw new Error('Failed to delete zone');
    }
  }
}