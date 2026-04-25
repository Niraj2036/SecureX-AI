import { IsNotEmpty, IsString } from "class-validator";

export class createDivisionDto {

    @IsString()
    @IsNotEmpty()
    name: string;

}