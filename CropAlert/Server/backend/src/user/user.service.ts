import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    console.log('Creating user with DTO:', dto);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hashedPassword });
    return this.userRepo.save(user);
  }

  async findAllFarmers(): Promise<User[]> {
    return this.userRepo.find({
      where: { role: 'farmer' },
    });
  }
  // async findAllUsers(): Promise<User[]> {
  //   return this.userRepo.find();
  // }
}