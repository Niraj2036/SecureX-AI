import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DocumentTypeEnum {
  offer_letter = 'offer_letter',
  id_proof = 'id_proof',
  policy = 'policy',
  nda = 'nda',
  contract = 'contract',
  payslip = 'payslip',
  other = 'other',
}

export enum AccessPermissionEnum {
  view = 'view',
  download = 'download',
  manage = 'manage',
}

export enum AccessTargetTypeEnum {
  user = 'user',
  team = 'team',
  department = 'department',
}

export class AccessEntryDto {
  @IsEnum(AccessTargetTypeEnum)
  targetType: AccessTargetTypeEnum;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsEnum(AccessPermissionEnum)
  permission: AccessPermissionEnum;
}

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DocumentTypeEnum)
  type: DocumentTypeEnum;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccessEntryDto)
  access?: AccessEntryDto[];
}
