import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiResponse({ description: 'you gonna have token' })
  @Post('login')
  login(@Body() req: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.LoginDto(req);
  }

  @UseGuards(JwtAuthGuard)
  @ApiSecurity('JWT-auth')
  @Get('me')
  async user(@Request() req) {
    return this.authService.validateUserById(req.user.userId);
  }
}
