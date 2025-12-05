import { PickType } from "@nestjs/mapped-types";
import { SignupDTO } from "./signup.dto";


export class SendOtpDTO extends PickType(SignupDTO, ['email']) { }