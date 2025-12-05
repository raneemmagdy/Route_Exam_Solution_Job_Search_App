import { Types } from 'mongoose';
import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsMongoId } from "class-validator";
import { CompanyMongoDBIdDTO } from "src/Modules/Company/DTO";

export class JobAndCompanyMongoDBIdDTO extends CompanyMongoDBIdDTO {
    @IsMongoId({ message: 'Job id must be a valid ObjectId' })
    jobId: Types.ObjectId;
}
export class JobAndCompanyMongoDBIdOptionalDTO extends PartialType(
  PickType(JobAndCompanyMongoDBIdDTO, ['jobId', 'companyId']),
) {}
export class JobMongoDBIdDTO extends PickType(JobAndCompanyMongoDBIdDTO, ['jobId']){}