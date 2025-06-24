import { Controller, Post, Body } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { CreateUserDto } from "../user/user.dto"

export class LoginDto {
  email: string
  password: string
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
