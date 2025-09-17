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
import { genSalt, hash } from 'bcryptjs';
import { ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from './entities/user.entity';
import { User } from '@prisma/client';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/utils/pagination';
import { UserDTO } from './dto/user.dto';
import { Serialize } from 'src/interceptors/serialize.iterceptor';

@ApiTags('user')
@Controller('users')
@Serialize(UserDTO)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: UserSignUpDTO) {
    if (createUserDto.role === Role.AdminOfSite)
      throw new ForbiddenException(
        'You can`t set the role don`t mass whit me... ',
      );
    const salt = await genSalt(10);
    const password = await hash(createUserDto.password, salt);

    return this.usersService.create({
      ...createUserDto,
      password,
      role: 'User',
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiSecurity('JWT-auth')
  @ApiResponse({ description: 'user all info' })
  @Get('profile')
  // @UseInterceptors(MapInterceptor(UserInfo, User, { isArray: false }))
  async userInfo(@Request() req): Promise<UserDTO> {
    const user: User = await this.usersService.findOneUser(
      'id',
      req.user.userId,
    );

    return user;
  }
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('JWT-auth')
  @Patch()
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update({ id: req.user.userId }, updateUserDto);
  }

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  async getUsers(
    @Query() query: PaginationOptions,
  ): Promise<PaginationResult<UserDTO>> {
    return this.usersService.findAll(query);
  }
}
