import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { TokenService } from "../Service";
import { reachToken } from "../Utils";
import { TokenEnum } from "../Enum";
import { Reflector } from "@nestjs/core";
import { tokenName } from "../Decorators/token.decorator";
import { GqlExecutionContext } from "@nestjs/graphql";


@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        private readonly tokenService: TokenService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const tokenType: TokenEnum = this.reflector.getAllAndOverride(tokenName, [
            // for route
            context.getHandler(),
            // for class
            context.getClass()
        ]) ?? TokenEnum.access;



        let request: any;
        let authorization: string = "";


        switch (context.getType<string>()) {
            case "http":
                const ctx = context.switchToHttp();
                request = ctx.getRequest()
                authorization = request.headers.authorization
                break;
                
            case "ws":
                const ws_ctx = context.switchToWs()
                request = ws_ctx.getClient()
                authorization = reachToken(request)
                break;

            case "graphql":
                request = GqlExecutionContext.create(context).getContext().req
                authorization = request.headers.authorization
                break;

            default:
                break;
        }
        if (!authorization) return false

        const { decoded, user } = await this.tokenService.decodedToken({
            authorization,
            tokenType,
        });
        request.credentials = { decoded, user }
        return true;
    }
}
