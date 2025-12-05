import { Module } from "@nestjs/common";
import { CompanyController } from "./company.controller";
import { CompanyService } from "./company.service";
import { CompanyModel, CompanyRepository, TokenModel, TokenRepository, UserModel, UserRepository } from "src/DB";
import { FileUploadService, TokenService } from "src/Common";
import { JwtService } from "@nestjs/jwt";
import { RouterModule } from "@nestjs/core";
import { JobModule } from "../Job/job.module";

@Module({
    imports: [
        CompanyModel, 
        TokenModel, 
        UserModel,
       

    ],
    controllers: [CompanyController],
    providers: [CompanyService, CompanyRepository, TokenRepository, TokenService, UserRepository, JwtService, FileUploadService]
})
export class CompanyModule { }