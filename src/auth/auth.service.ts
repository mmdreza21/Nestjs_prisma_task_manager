import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async LoginDto(req: LoginDto) {
    const user = await this.validate(req);
    return {
      accessToken: this.jwtService.sign({ userId: user.id, role: user.role }),
    };
  }

  async validate({ email, password }: LoginDto) {
    const user = await this.userService.findOneUser('email', email);
    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException('ایمیل یا کلمه عبپور شما اشتباه است');
    }
    return user;
  }

  async validateUserById(userId: string) {
    const user = await this.userService.findOneUser('id', userId);
    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }
    return user;
  }
}
