import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login-dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // 🧠 Main entry point for login
  public async login(dto: LoginDto) {
    const user = await this.validateUserCredentials(dto);

    if (!user.isEmailVerified) {
      throw new ForbiddenException('لطفاً ابتدا ایمیل خود را تأیید کنید.');
    }

    const accessToken = this.generateAccessToken(user.id);
    return { accessToken };
  }

  // 🔍 Checks if credentials are valid
  private async validateUserCredentials({
    email,
    password,
  }: LoginDto): Promise<User> {
    const user = await this.usersService.findOneUser('email', email);

    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    return user;
  }

  // 🔐 Generates JWT token for authenticated user
  private generateAccessToken(userId: string): string {
    return this.jwtService.sign({ userId });
  }

  // 🧩 Used by guards / JWT strategies to fetch user by ID
  async validateUserById(userId: string): Promise<User> {
    const user = await this.usersService.findOneUser('id', userId);
    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }
    return user;
  }
}
