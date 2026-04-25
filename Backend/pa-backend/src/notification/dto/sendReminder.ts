import { IsNotEmpty, IsString } from "class-validator";

export class sendReminder {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    templateId: string;
    
    @IsString()
    @IsNotEmpty()
    formResId:string


}