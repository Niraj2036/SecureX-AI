import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AccessEntryDto } from './create-document.dto';

export class UpdateAccessDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccessEntryDto)
  access: AccessEntryDto[];
}
