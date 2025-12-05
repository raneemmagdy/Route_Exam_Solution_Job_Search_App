import { IsMongoId } from "class-validator";
import { Types } from "mongoose";

export class CompanyMongoDBIdDTO {
    @IsMongoId({ message: 'Company id must be a valid ObjectId' })
    companyId: Types.ObjectId;
}


