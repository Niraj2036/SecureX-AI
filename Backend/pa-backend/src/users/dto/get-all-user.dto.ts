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

export class GetAllUserDto {
  @IsOptional()
  @IsString()
  search:string;

  @IsOptional()
  @IsNumber({}, { message: 'pageNo must be a valid number' })
  @Type(() => Number)
    pageNo:number;

  @IsOptional()
  @IsNumber({}, { message: 'pageNo must be a valid number' })
  @Type(() => Number)
  pageSize:number;
}
