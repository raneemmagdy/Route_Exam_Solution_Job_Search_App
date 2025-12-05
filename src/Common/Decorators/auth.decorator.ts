import { applyDecorators, UseGuards } from "@nestjs/common";
import { RoleEnum, TokenEnum } from "../Enum";
import { Roles,Token } from "./";
import { AuthenticationGuard,AuthorizationGuard } from "../Guards";

export function Auth(roles: RoleEnum[], type: TokenEnum = TokenEnum.access) {
    return applyDecorators(
        Token(type),
        Roles(roles),
        UseGuards(AuthenticationGuard, AuthorizationGuard)
    );
}