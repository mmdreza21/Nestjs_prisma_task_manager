import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  id: string;
  @MaxLength(20)
  @MinLength(3)
  @ApiProperty({
    type: String,
    description: 'your name max:20,min:3',
    default: 'new name',
  })
  firstName?: string;

  @MaxLength(20)
  @MinLength(3)
  @ApiProperty({
    type: String,
    description: 'lastNAme max:20,min:3',
    default: 'new name',
  })
  lastName?: string;

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    type: String,
    description:
      'some address make sure it`s string but you can have more than one address this is just your first address ',
    default: ['mmd Abad', 'reza abad'],
  })
  addresses: Array<string>;
  @IsNotEmpty()
  @MinLength(11)
  @MaxLength(11)
  @Matches(/^09/, {
    message: 'phone number must have 09',
  })
  @ApiProperty({
    type: String,
    description: 'your phone number',
    default: '09123456789',
  })
  phone: string;
}
