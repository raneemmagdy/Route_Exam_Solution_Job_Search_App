import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./Database.repository";
import { Model } from "mongoose";
import { User, type UserDocument } from "../Models/User.model";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UserRepository extends DatabaseRepository<User> {
   constructor(@InjectModel(User.name) protected readonly model: Model<UserDocument>) {
      super(model);
   }


   async emailExist(email: string): Promise<boolean> {
      if (await this.findOne({ filter: { email } })) return true
      return false
   }

}
