import { IsNotEmpty, IsString } from "class-validator";

export class CheckDomainDto {
    @IsString()
    @IsNotEmpty()
    domain: string;
}
