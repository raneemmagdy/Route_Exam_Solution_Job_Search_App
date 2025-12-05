import { Module } from "@nestjs/common";
import { RealtimeGateway } from "./gateway";
import { JwtService } from "@nestjs/jwt";
import { ChatModel, CompanyModel, CompanyRepository, TokenModel, TokenRepository, UserModel, UserRepository } from "src/DB";
import { TokenService } from "src/Common";
import { ChatService } from "../Chat/chat.service";
import { ChatRepository } from "src/DB/Repository/chat.repository";
@Module({
    imports: [
        TokenModel,
        UserModel,
        ChatModel,
        CompanyModel
    ],
    providers: [RealtimeGateway, JwtService, TokenService, TokenRepository, UserRepository,ChatService,ChatRepository,CompanyRepository]
})
export class GatewayModule { }