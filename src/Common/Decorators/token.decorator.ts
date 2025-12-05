import { SetMetadata } from "@nestjs/common";
import { TokenEnum } from "../Enum";

export const tokenName = "tokenType"
export const Token = (type: TokenEnum = TokenEnum.access) => {
    return SetMetadata(tokenName, type);
}