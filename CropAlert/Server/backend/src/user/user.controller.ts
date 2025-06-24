import { Body, Controller, Post, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateUserDto) {
    console.log('Creating user with DTO:', dto);
    return this.userService.createUser(dto);
  }

  @Get('/farmers')
  getAll() {
    return this.userService.findAllFarmers();
  }
}
