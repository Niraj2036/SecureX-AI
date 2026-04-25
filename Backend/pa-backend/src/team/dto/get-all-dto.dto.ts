import {
  IsString,
  IsEnum,
  IsEmail,
  IsOptional,
  Matches,
  MinLength,
  MaxLength,
  isPhoneNumber,
  IsNumber,IsArray
} from 'class-validator';
import { industry, employeeSize } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetAllDto {
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

  @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
    scope?: string[];
}
