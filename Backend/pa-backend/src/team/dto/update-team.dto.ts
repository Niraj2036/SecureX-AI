// update-team.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamDto } from './create-team.dto'; // Import CreateTeamDto for reusability

export class UpdateTeamDto extends PartialType(CreateTeamDto) {}
