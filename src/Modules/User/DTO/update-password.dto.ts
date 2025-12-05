import { PickType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsStrongPassword } from "class-validator";
import { SignupDTO } from "src/Modules/Auth/DTO";

export class UpdatePasswordDTO extends PickType(SignupDTO, ['password', 'confirmPassword']) {
    @IsStrongPassword({}, { message: 'Password must be 8 characters or more and contain at least one lowercase letter, one uppercase letter, one number, and one special character' })
    @IsNotEmpty({ message: 'Password is required' })
    oldPassword: string;
}