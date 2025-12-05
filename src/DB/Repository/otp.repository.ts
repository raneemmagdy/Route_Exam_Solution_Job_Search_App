import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./Database.repository";
import { Model } from "mongoose";
import { Otp,type  OtpDocument } from "../Models/Otp.model";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class OtpRepository extends DatabaseRepository<Otp> {
   constructor(@InjectModel(Otp.name) protected readonly model: Model<OtpDocument>) {
      super(model);

   }
}