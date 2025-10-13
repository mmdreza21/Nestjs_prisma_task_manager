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
import { randomInt } from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const oldUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (oldUser)
      throw new BadRequestException(
        'کاربر دیگری با این ایمیل ثبت نام کرده است!',
      );

    const hashedPassword = await this.hashPassword(data.password);
    const user = await this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });

    await this.sendEmailVerification(user.email);

    return user;
  }

  async sendEmailVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    if (user.isEmailVerified)
      throw new BadRequestException('Email already verified');

    const otp = randomInt(100000, 999999).toString(); // 6-digit code
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailOtp: otp,
        emailOtpExpiry: expiry,
      },
    });

    await this.mailService.sendEmail(
      user.email,
      'کد تأیید ایمیل شما',
      `
        <h1>تأیید حساب کاربری</h1>
        <p>کد تأیید شما: <b>${otp}</b></p>
        <p>این کد تا ۱۰ دقیقه معتبر است.</p>
      `,
    );

    return { message: 'OTP sent successfully' };
  }

  async verifyEmailOtp(
    email: string,
    otp: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    if (user.isEmailVerified)
      throw new BadRequestException('User already verified');

    if (!user.emailOtp || !user.emailOtpExpiry)
      throw new BadRequestException('OTP not generated');

    if (user.emailOtp !== otp) throw new BadRequestException('Invalid OTP');

    if (user.emailOtpExpiry < new Date())
      throw new BadRequestException('OTP expired');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailOtp: null,
        emailOtpExpiry: null,
      },
    });

    return { message: 'Email verified successfully' };
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

    // Generate a 6-digit OTP
    const otp = randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 mins

    // Save OTP and expiry in DB
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPassToken: otp,
        dateOfToken: expiry,
      },
    });

    // Send email
    await this.mailService.sendEmail(
      user.email,
      'بازیابی رمز عبور',
      `
      <h1>بازیابی رمز عبور</h1>
      <p>کد بازیابی شما: <b>${otp}</b></p>
      <p>این کد تا ۱۰ دقیقه معتبر است.</p>
    `,
    );

    return { message: 'Password reset OTP sent successfully' };
  }

  async resetPassword(dto: ResetPasswordDTO) {
    const user = await this.prisma.user.findFirst({
      where: { resetPassToken: dto.token },
    });

    if (!user) throw new BadRequestException('Invalid OTP');

    // Check if token expired
    if (user.dateOfToken && new Date().getTime() > user.dateOfToken.getTime()) {
      throw new BadRequestException('OTP expired');
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
