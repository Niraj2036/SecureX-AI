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
export class LoginUserDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;
  @IsString()
  password: string;
}
