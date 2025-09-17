import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDTO, UserSignUpDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { genSalt, hash } from 'bcryptjs';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from './entities/user.entity';
import { User } from '@prisma/client';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

@ApiTags('user')
@Controller('users')
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
  async getUsers(@Paginate() query: PaginateQuery) {
    return this.usersService.findUsers(query);
  }
}
