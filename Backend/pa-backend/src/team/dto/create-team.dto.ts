// create-team.dto.ts
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { teamType } from '@prisma/client';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  leadId: string;

  @IsOptional() // This field is optional for creation
  @IsString()
  parentId?: string;

  @IsEnum(teamType)
  @IsNotEmpty()
  type: teamType;
}
