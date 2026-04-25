import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @IsEmail({}, { message: 'Invalid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Reason is required.' })
  reason: string; // Reason for sending the OTP
}

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Invalid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number.' })
  otp: string;
}
export class ResetPasswordDto {
  newPassword: string;
}
