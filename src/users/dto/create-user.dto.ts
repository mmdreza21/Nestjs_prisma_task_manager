import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'bson';
import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../entities/user.entity';

export class UserSignUpDTO {
  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(3)
  @ApiProperty({
    type: String,
    description: 'your name max:20,min:3',
    default: 'test',
  })
  firstName: string;

  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(3)
  @ApiProperty({
    type: String,
    description: 'lastNAme max:20,min:3',
    default: 'testing',
  })
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: String,
    description: 'an email address contain ~~@~~.com',
    default: 'test',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'it`s most be uniq',
    default: 'test',
  })
  userName: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[a-z]).*$/, {
    message: 'password is too weak',
  })
  @ApiProperty({
    type: String,
    description:
      'password  most have at least 6 character with a {lower case} and an {upper case} word',
    default: '123Asd',
  })
  password: string;

  role?: Role;
}

export class UserDTO {
  id: string | ObjectId;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  addresses?: Array<string>;
  createdAt: Date;
  updatedAt: Date;
}
