import { Global, Module } from "@nestjs/common";
import { TokenRepository } from "src/DB/Repository/Token.repository";
import { UserRepository } from "src/DB/Repository/user.repository";
import { UserModel } from "src/DB/Models/User.model";
import { TokenModel } from "src/DB/Models/Token.model";
import { TokenService } from "../Service";
import { JwtService } from "@nestjs/jwt";
@Global()
@Module({
    imports: [
        UserModel,
        TokenModel,
    ],
    providers: [UserRepository, TokenRepository, TokenService, JwtService],
    exports: [UserRepository, TokenRepository, TokenService, JwtService, UserModel, TokenModel],
})
export class CommonModule { }
