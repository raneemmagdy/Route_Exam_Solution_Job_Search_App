import { Module } from "@nestjs/common";
import { ApplicationModel, ApplicationRepository, ChatModel, CompanyModel, CompanyRepository, JobModel, JobRepository, TokenModel, TokenRepository, UserModel, UserRepository } from "src/DB";
import { ApplicationController } from "./application.controller";
import { ApplicationService } from "./application.service";
import { FileUploadService, TokenService } from "src/Common";
import { JwtService } from "@nestjs/jwt";
import { JobService } from "../Job/job.service";
import { RealtimeGateway } from "../gateway/gateway";
import { ChatService } from "../Chat/chat.service";
import { ChatRepository } from "src/DB/Repository/chat.repository";

@Module({
    imports: [ApplicationModel, UserModel, TokenModel, JobModel, CompanyModel, ChatModel],
    controllers: [ApplicationController],
    providers: [
        ApplicationService, ApplicationRepository,
        FileUploadService, JwtService, TokenService, UserRepository, TokenRepository, JobService, JobRepository, CompanyRepository,
        RealtimeGateway,ChatService,ChatRepository]
})
export class ApplicationModule { }