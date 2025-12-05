import {  CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleEnum } from "../Enum";
import { roleName } from "../Decorators/role.decorator";
import { GqlExecutionContext } from "@nestjs/graphql";


@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private reflector: Reflector) { }
    canActivate(context: ExecutionContext): boolean {

        const accessRoles = this.reflector.getAllAndOverride<RoleEnum[]>(roleName, [
            // for route
            context.getHandler(),
            // for class
            context.getClass()
        ]) ?? []

        let role: RoleEnum = RoleEnum.User

        switch (context.getType<string>()) {
            case "http":
                role = context.switchToHttp().getRequest().credentials.user.role
                break;

            case "ws":
                role = context.switchToWs().getClient().credentials.user.role
                break;

            case "graphql":
                role = GqlExecutionContext.create(context).getContext().req.credentials.user.role
                break;

            default:
                break;
        }


        return accessRoles.includes(role)
    }
}