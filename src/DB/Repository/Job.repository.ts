import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./Database.repository";
import { Model } from "mongoose";
import { Job,type JobDocument } from "../Models/Job.model";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class JobRepository extends DatabaseRepository<Job> {
   constructor(@InjectModel(Job.name) protected readonly model: Model<JobDocument>) {
      super(model);
   }
}