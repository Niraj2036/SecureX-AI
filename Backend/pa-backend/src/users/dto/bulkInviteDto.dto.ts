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

export class BulkInviteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

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
  @IsOptional()
  teamName: string;

  @IsString()
  @IsOptional()
  deptName:string;

  @IsString()
  @IsOptional()
  empId:string;

  @IsString()
  @IsOptional()
  joiningDate:string;

  @IsString()
  @IsOptional()
  role:string;

  @IsString()
  @IsOptional()
  gender:string;

  @IsString()
  @IsOptional()
  dob:string;

  @IsString()
  @IsOptional()
  managerMail:string;

  @IsString()
  @IsOptional()
  probationDuration:string;

  @IsString()
  @IsOptional()
  probationEnd:string;

  @IsString()
  @IsOptional()
  salary:string;

  @IsString()
  @IsOptional()
  salaryCurrency:string;

  @IsString()
  @IsOptional()
  exitReason:string;

  @IsString()
  @IsOptional()
  linkedinURL:string;
}
