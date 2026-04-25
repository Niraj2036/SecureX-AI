import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateSelfDto  {
    @IsString()
    @IsOptional()
    name :string;
}
