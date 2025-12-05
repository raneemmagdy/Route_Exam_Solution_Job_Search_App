import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./Database.repository";
import { Model } from "mongoose";
import { Token, type TokenDocument } from "../Models/Token.model";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class TokenRepository extends DatabaseRepository<Token> {
   constructor(@InjectModel(Token.name) protected readonly model: Model<TokenDocument>) {
      super(model);
   }
}