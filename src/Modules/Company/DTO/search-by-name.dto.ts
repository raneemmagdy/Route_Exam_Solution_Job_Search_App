import { PickType } from "@nestjs/mapped-types";
import { AddCompanyDTO } from "./add-comapny.dto";

export class SearchByNameDTO extends PickType(AddCompanyDTO, ['companyName']){}