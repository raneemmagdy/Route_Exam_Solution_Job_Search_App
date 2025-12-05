import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./Database.repository";
import { Model } from "mongoose";
import { Application, type ApplicationDocument } from "../Models/Application.model";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class ApplicationRepository extends DatabaseRepository<Application> {
   constructor(@InjectModel(Application.name) protected readonly model: Model<ApplicationDocument>) {
      super(model);
   }
}