import { Module } from "@nestjs/common";
import { ChatModel, CompanyModel, CompanyRepository, TokenModel, TokenRepository, UserModel, UserRepository } from "src/DB";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { ChatRepository } from "src/DB/Repository/chat.repository";
import { TokenService } from "src/Common";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [ChatModel,CompanyModel,UserModel,TokenModel],
    controllers: [ChatController],
    providers: [ChatService,CompanyRepository, UserRepository, ChatRepository,TokenService,JwtService,TokenRepository]
})
export class ChatModule {}