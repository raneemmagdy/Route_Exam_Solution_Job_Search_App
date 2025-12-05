import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TokenModel, TokenRepository, UserModel, UserRepository } from "src/DB";
import { FileUploadService, TokenService } from "src/Common";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [UserModel,TokenModel],
    controllers: [UserController],
    providers: [UserService,UserRepository,TokenService,TokenRepository,JwtService,FileUploadService],
})
export class UserModule {}