import {
  IsString,
  IsEnum,
  IsEmail,
  IsOptional,
  Matches,
  MinLength,
  MaxLength,
  isPhoneNumber,
} from 'class-validator';
export class LoginWithGoogleDto {
  @IsString()
  token: string;
}
