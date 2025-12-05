import { AddCompanyDTO } from './add-comapny.dto';
import { PartialType, PickType } from "@nestjs/mapped-types";

export class UpdateCompanyDTO extends PartialType(
  PickType(AddCompanyDTO, ['companyName', 'description', 'industry', 'address', 'numberOfEmployees', 'companyEmail', 'HRs'])
) {}