import { IsString, IsOptional, IsNumber, IsDateString, isEnum, IsEnum } from 'class-validator';
import { employeeSize,industry } from '@prisma/client';
import e from 'express';
export class CompanyDTO {
  

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  desc?: string;

  // @IsDateString()
  @IsOptional()
  establishedDate?: Date;

  @IsString()
  @IsOptional()
  streetAddress?: string;

  @IsNumber()
  @IsOptional()
  streetNo?: number;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsNumber()
  @IsOptional()
  zipCode?: number;

  @IsString()
  @IsOptional()
  identifier?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  createdAt?: Date;

  @IsDateString()
  @IsOptional()
  updatedAt?: Date;

  @IsString()
  @IsOptional()
  vatNo?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsOptional()
  @IsEnum(employeeSize)
  employeeSize?:employeeSize; // Replace with actual type definition for `employeeSize`

  @IsOptional()
  @IsEnum(industry)
  industry?: industry; // Replace with actual type definition for `industry`

  @IsString()
  @IsOptional()
  billingEmail:string;

  @IsString()
  @IsOptional()
  contactPerson:string;
}
