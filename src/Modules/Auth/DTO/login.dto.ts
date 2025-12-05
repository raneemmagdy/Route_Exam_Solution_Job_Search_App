import { PickType } from "@nestjs/mapped-types";
import { SignupDTO } from "./signup.dto";

export class loginDTO extends PickType(SignupDTO, ['email', 'password']) { }