import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDate,
  IsPhoneNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { status } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneCode: string;

  @IsPhoneNumber(null)
  mobile: string;

  @IsString()
  companyName: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  designation: string;

  @IsEnum(status)
  status: status;

  @MinLength(8)
  @IsString()
  password: string;

  @IsDate()
  joiningDate: Date;

  @IsString()
  role: string;

  @IsOptional()
  data?: any;
}
