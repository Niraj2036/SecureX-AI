// src/invite/dto/invite-user.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class InviteUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  companyId:string

  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phoneCode: string; // For country code
  @IsOptional()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  designation: string;


  @IsString()
  @IsNotEmpty()
  managerId: string;

  @IsString()
  @IsOptional()
  teamId: string;

  @IsString()
  @IsOptional()
  orgUnit:string;

  @IsBoolean()
  isAdmin:boolean;
  @IsBoolean()
  isTeamLead:boolean;
  @IsBoolean()
  isDeptHead:boolean;



}
