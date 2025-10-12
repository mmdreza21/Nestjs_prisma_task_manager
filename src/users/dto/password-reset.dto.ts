import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

// ======================
// Forgot Password DTO
// ======================
export class ForgotPasswordDTO {
  @ApiProperty({
    description: 'Email of the user requesting password reset',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}

// ======================
// Reset Password DTO
// ======================
export class ResetPasswordDTO {
  @ApiProperty({
    description: 'Token sent to user for password reset',
    example: 'f3d4b1a2c9e8f6...',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'MyStrongPassword123!',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 128, {
    message: 'Password must be between 6 and 128 characters',
  })
  newPassword: string;
}
