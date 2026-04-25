import { userVisibility } from "@prisma/client";
import { IsNotEmpty, IsString } from "class-validator";

enum UserVisibilityType {
    "checkIn"="checkIn",
    "oneOnOne"="oneOnOne",
    "performance"="performance",
}


export class UpdateUserVisibilityDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    type:UserVisibilityType;

    @IsString()
    @IsNotEmpty()
    visibility: userVisibility

}