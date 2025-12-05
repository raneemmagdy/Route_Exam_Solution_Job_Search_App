import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { CompanyModel, CompanyRepository, TokenModel, TokenRepository, UserModel, UserRepository } from "src/DB";
import { JwtService } from "@nestjs/jwt";
import { FileUploadService, TokenService } from "src/Common";
import { AdminResolver } from "./admin.resolver";
import { UserService } from "../User/user.service";
import { CompanyService } from "../Company/company.service";

@Module({
    imports: [UserModel,CompanyModel,TokenModel],
    controllers: [AdminController],
    providers: [AdminService,UserRepository,UserService,CompanyService,FileUploadService,CompanyRepository,TokenRepository,JwtService,TokenService,AdminResolver],
})
export class AdminModule {}