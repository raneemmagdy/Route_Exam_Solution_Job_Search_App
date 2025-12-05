import { IntersectionType, PickType } from "@nestjs/mapped-types";
import { SignupDTO } from "./signup.dto";
import { ConfirmOtpDTO } from "./confirm-otp.dto";


export class ResetPasswordDTO extends IntersectionType(
    PickType(SignupDTO, ['email', 'password', 'confirmPassword']),
    PickType(ConfirmOtpDTO, ['otp']),
) { }