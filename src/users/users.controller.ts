import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  UseGuards,
  Request,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserSignUpDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from './entities/user.entity';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/utils/pagination';
import { UserDTO } from './dto/user.dto';
import { Serialize } from 'src/interceptors/serialize.iterceptor';
import { ChangePasswordDTO } from './dto/change-password-dto';
import {
  SendEmailVerificationDTO,
  VerifyEmailOtpDTO,
} from './dto/email-verification.dto';
import {
  CommonSwaggerGet,
  CommonSwaggerPost,
} from 'src/common/decorators/common-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@Serialize(UserDTO)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // -------------------- CREATE USER --------------------
  @Post()
  @CommonSwaggerPost({ summary: 'Create a new user' })
  async create(@Body() createUserDto: UserSignUpDTO): Promise<UserDTO> {
    if (createUserDto.role === Role.AdminOfSite) {
      throw new ForbiddenException(
        'You cannot set the role to AdminOfSite directly!',
      );
    }
    return this.usersService.create({ ...createUserDto, role: Role.User });
  }

  // -------------------- GET CURRENT USER PROFILE --------------------
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @CommonSwaggerGet({ summary: 'Get current user profile' })
  async getProfile(@Request() req): Promise<UserDTO> {
    return this.usersService.findOneUser('id', req.user.userId);
  }

  // -------------------- UPDATE USER --------------------
  @UseGuards(JwtAuthGuard)
  @Patch()
  @CommonSwaggerPost({ summary: 'Update current user info' })
  async update(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDTO> {
    return this.usersService.update({ id: req.user.userId }, updateUserDto);
  }

  // -------------------- GET ALL USERS WITH PAGINATION --------------------
  @Get()
  @CommonSwaggerGet({ summary: 'Get list of users with pagination' })
  async getUsers(
    @Query() query: PaginationOptions,
  ): Promise<PaginationResult<UserDTO>> {
    return this.usersService.findAll(query);
  }

  // -------------------- CHANGE PASSWORD --------------------
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @CommonSwaggerPost({ summary: 'Change user password' })
  async changePassword(@Request() req, @Body() dto: ChangePasswordDTO) {
    return this.usersService.changePassword(req.user.userId, dto);
  }

  // -------------------- EMAIL VERIFICATION --------------------
  @Post('send-verification')
  @CommonSwaggerPost({ summary: 'Send email verification OTP' })
  async sendEmailVerification(@Body() dto: SendEmailVerificationDTO) {
    return this.usersService.sendEmailVerification(dto.email);
  }

  @Post('verify-email')
  @CommonSwaggerPost({ summary: 'Verify email OTP' })
  async verifyEmail(@Body() dto: VerifyEmailOtpDTO) {
    return this.usersService.verifyEmailOtp(dto.email, dto.otp);
  }
}
