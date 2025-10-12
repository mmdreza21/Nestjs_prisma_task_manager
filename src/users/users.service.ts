import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { ObjectId } from 'bson';

import { PrismaService } from 'src/prisma/prismaService';

// Import the Prisma-specific paginate function
import {
  paginatePrisma,
  PaginationOptions,
  PaginationResult,
} from '../common/utils/pagination';
import { UserDTO } from './dto/user.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { ChangePasswordDTO } from './dto/change-password-dto';
import { ForgotPasswordDTO, ResetPasswordDTO } from './dto/password-reset.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const oldUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (oldUser)
      throw new BadRequestException(
        'کاربر دیگری با این ایمیل ثبت نام کرده است!',
      );

    const hashedPassword = await this.hashPassword(data.password);

    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
  }

  async findAll(query: PaginationOptions): Promise<PaginationResult<UserDTO>> {
    return paginatePrisma(this.prisma.user, query, {});
  }

  async findOneUser(key: string, value: string | ObjectId): Promise<User> {
    const user: User = await this.prisma.user.findFirst({
      where: { [key]: value },
    });
    return user;
  }

  async userProfile(id) {
    console.log(id.id);
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    req: Prisma.UserUpdateInput,
  ): Promise<User> {
    let user = await this.prisma.user.update({
      data: req,
      where,
    });
    console.log(user);

    if (!user) throw new NotFoundException('کاربر پیدا نشد');
    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDTO) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new BadRequestException('User not found');

    const isOldPassValid = await compare(dto.oldPassword, user.password);
    if (!isOldPassValid)
      throw new BadRequestException('Incorrect old password');

    const hashedPassword = await this.hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new NotFoundException('User not found');

    // Generate a secure random token
    const token = randomBytes(32).toString('hex');
    const dateOfToken = new Date();

    // Save token and timestamp in DB
    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPassToken: token, dateOfToken },
    });

    // Here you can send the token to user via email
    return { message: 'Reset password token generated', token }; // return token only for testing
  }

  async resetPassword(dto: ResetPasswordDTO) {
    const user = await this.prisma.user.findFirst({
      where: { resetPassToken: dto.token },
    });

    if (!user) throw new BadRequestException('Invalid token');

    // Optional: check if token expired (e.g., valid for 1 hour)
    if (
      user.dateOfToken &&
      new Date().getTime() - user.dateOfToken.getTime() > 1000 * 60 * 60
    ) {
      throw new BadRequestException('Token expired');
    }

    const hashedPassword = await this.hashPassword(dto.newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPassToken: null,
        dateOfToken: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    return hash(password, salt);
  }
}
