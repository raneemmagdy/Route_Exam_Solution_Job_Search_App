import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./Database.repository";
import { Model } from "mongoose";
import { Company, type CompanyDocument } from "../Models/Company.model";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class CompanyRepository extends DatabaseRepository<Company> {
   constructor(@InjectModel(Company.name) protected readonly model: Model<CompanyDocument>) {
      super(model);
   }
}