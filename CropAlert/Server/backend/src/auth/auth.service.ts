import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { UserService } from "../user/user.service"
import * as bcrypt from "bcrypt"

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email)
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user
      return result
    }
    return null
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password)
    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const payload = { email: user.email, sub: user.id, role: user.role }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  }

  async register(createUserDto: any) {
    try {
      // Check if user already exists
      const existingUser = await this.userService.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new UnauthorizedException('User with this email already exists');
      }

      // Create new user
      const user = await this.userService.createUser(createUserDto);
      
      // Generate JWT token
      const payload = { email: user.email, sub: user.id, role: user.role };
      const access_token = this.jwtService.sign(payload);
      
      return {
        access_token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Registration failed');
    }
  }
}
