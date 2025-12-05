import { PickType } from "@nestjs/mapped-types";
import { SignupDTO } from "./signup.dto";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class ConfirmOtpDTO extends PickType(SignupDTO, ['email']) {
    @IsString({ message: 'Otp must be a string' })
    @IsNotEmpty({ message: 'Otp is required' })
    @Matches(/^[0-9]{6}$/, { message: 'Otp must be 6 digits' })
    otp: string
}