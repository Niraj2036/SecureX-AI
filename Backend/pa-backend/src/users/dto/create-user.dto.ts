import {
  IsString,
  IsEnum,
  IsEmail,
  IsOptional,
  Matches,
  MinLength,
  MaxLength,
  isPhoneNumber,
  IsNumber,
} from 'class-validator';
import { industry, employeeSize } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name can be up to 50 characters long' })
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneCode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Matches(/^(\+?\d{1,3}[\s-]?)?(\(?\d{1,4}\)?[\s-]?)?[\d\s-]{7,15}$/, {
    message: 'Invalid mobile number',
  })
  mobile: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Company name can be up to 100 characters long' })
  companyname: string;

  @ApiProperty()
  @IsString()
  @Matches(
    /^(https?:\/\/)?([a-zA-Z0-9]+\.)?[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9\-._~:?#\[\]@!$&'()*+,;=]*)?$/,
    { message: 'Invalid website URL' },
  )
  website: string;

  @ApiProperty()
  @IsString()
  designation: string;

  @ApiProperty()
  @IsEnum(industry, { message: 'Invalid industry' })
  industry: industry;

  @ApiProperty()
  @IsEnum(employeeSize, { message: 'Invalid employee size' })
  employeeSize: employeeSize;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsNumber()
  @IsOptional()
  userLimit: number;
}
