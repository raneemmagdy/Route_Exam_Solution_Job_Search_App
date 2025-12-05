import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./Database.repository";
import { Model } from "mongoose";
import { Chat, type ChatDocument } from "../Models/Chat.model";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class ChatRepository extends DatabaseRepository<Chat> {
   constructor(@InjectModel(Chat.name)protected readonly model: Model<ChatDocument>) {
      super(model);
   }
}