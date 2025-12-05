import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { NumberOfEmployeeEnum } from "src/Common";
import { CompanyDocument } from "src/DB";
import { FileResponse } from "src/Modules/User/Entity/user.entity";

export class CompanyResponse{
    company:CompanyDocument
}

//================================================GraphQL================================================//
registerEnumType(NumberOfEmployeeEnum, {
    name: "NumberOfEmployeeEnum",
    description: "Number of employee enum GraphQL",
})
@ObjectType()
export class OneCompanyResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  companyName: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  industry: string;

  @Field(() => String,{ nullable: true })
  address?: string;

  @Field(() => NumberOfEmployeeEnum)
  numberOfEmployees: NumberOfEmployeeEnum;

  @Field(() => String)
  companyEmail: string;

  @Field(() => ID)
  createdBy: string;

  @Field(() => FileResponse, { nullable: true })
  logo?: FileResponse;

  @Field(() => FileResponse, { nullable: true })
  coverPic?: FileResponse;

  @Field(() => [ID], { nullable: true })
  HRs?: string[];

  @Field(() => Date,{ nullable: true })
  bannedAt?: Date;

  @Field(() => Date,{ nullable: true })
  deletedAt?: Date;

  @Field(() => FileResponse, { nullable: true })
  legalAttachment?: FileResponse;

  @Field({ nullable: true })
  approvedByAdmin?: boolean;
}


@ObjectType({ description: "get all companies response GraphQL" })
export class GetAllCompanyResponse {
    @Field(() => Number, { nullable: true })
    docsCount?: number | undefined
    @Field(() => Number, { nullable: true })
    limit?: number | undefined
    @Field(() => Number, { nullable: true })
    currentPage?: number | undefined
    @Field(() => Number, { nullable: true })
    pages?: number | undefined
    @Field(() => [OneCompanyResponse])
    result: OneCompanyResponse[] | []

}