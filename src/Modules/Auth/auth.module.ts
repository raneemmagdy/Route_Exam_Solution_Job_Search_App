import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { OtpModel, OtpRepository, TokenModel, TokenRepository, UserModel, UserRepository } from "src/DB";
import { TokenService } from "src/Common";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [UserModel,OtpModel,TokenModel],
    controllers: [AuthController],
    providers: [AuthService, UserRepository,OtpRepository,TokenRepository,JwtService,TokenService]
})
export class AuthModule {}