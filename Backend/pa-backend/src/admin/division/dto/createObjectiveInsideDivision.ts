import { IsNotEmpty, IsString } from "class-validator";

export class CreateObjectiveDivision {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    divisionId: string;


}