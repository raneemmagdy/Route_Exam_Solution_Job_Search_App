import { PartialType, PickType } from "@nestjs/mapped-types";
import { SignupDTO } from "src/Modules/Auth/DTO";

export class UpdateAccountDTO extends PartialType(
  PickType(SignupDTO, ['gender', 'firstName', 'lastName', 'mobileNumber', 'DOB'])
) {}