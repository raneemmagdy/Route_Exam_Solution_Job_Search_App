import { Module } from "@nestjs/common";
import { JobService } from "./job.service";
import { JobController } from "./job.controller";
import { CompanyModel, CompanyRepository, JobModel, JobRepository, TokenModel, TokenRepository, UserModel, UserRepository } from "src/DB";
import { TokenService } from "src/Common";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [
        JobModel,
        CompanyModel,
        UserModel,
        TokenModel
    ],
    controllers: [JobController],
    providers: [JobService, CompanyRepository, JobRepository,TokenService, UserRepository,JwtService,TokenRepository]
})
export class JobModule { }