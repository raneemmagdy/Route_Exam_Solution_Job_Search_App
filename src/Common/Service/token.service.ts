import { JwtPayload } from './../../../node_modules/@types/jsonwebtoken/index.d';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt";
import { TokenRepository } from 'src/DB/Repository/Token.repository';
import { UserRepository } from 'src/DB/Repository/user.repository';
import type { TokenDocument, UserDocument } from "src/DB";
import { PrefixLevelEnum, RoleEnum, TokenEnum } from '../Enum';
import { TokenEntity, TokenSignature } from '../Entity';
import { randomUUID } from 'crypto';
import { BadRequestException, HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';


@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userRepository: UserRepository,
        private readonly tokenRepository: TokenRepository,
    ) { }

    //_______________________________________________GENERATE TOKEN
    generateToken = async ({
        payload,
        options = {
            secret: process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
            expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN)
        }
    }: {
        payload: object,
        options?: JwtSignOptions
    }): Promise<string> => {
        console.log({ payload, options });
        return await this.jwtService.signAsync(payload, options);
    };


    //_______________________________________________VERIFY TOKEN
    verifyToken = async ({
        token,
        options = {
            secret: process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
        }
    }: {
        token: string,
        options?: JwtVerifyOptions,
    }): Promise<JwtPayload> => {
        return await this.jwtService.verifyAsync(token, options) as unknown as JwtPayload;
    }

    //_______________________________________________DETECT PREFIX
    detectedPrefix = async (role: RoleEnum = RoleEnum.User): Promise<PrefixLevelEnum> => {
        let PrefixLevel: PrefixLevelEnum = PrefixLevelEnum.Bearer;

        switch (role) {
            case RoleEnum.Admin:
                PrefixLevel = PrefixLevelEnum.System;
                break;

            default:
                PrefixLevel = PrefixLevelEnum.Bearer;
                break;
        }

        return PrefixLevel;
    }

    //_______________________________________________GET SIGNATURE
    getSignatures = async (prefixLevel: PrefixLevelEnum = PrefixLevelEnum.Bearer): Promise<TokenSignature> => {
        let signatures: TokenSignature = {
            access_signature: "",
            refresh_signature: ""
        }

        switch (prefixLevel) {
            case PrefixLevelEnum.System:
                signatures.access_signature = process.env.ACCESS_SYSTEM_TOKEN_SIGNATURE as string
                signatures.refresh_signature = process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE as string
                break;

            default:
                signatures.access_signature = process.env.ACCESS_USER_TOKEN_SIGNATURE as string
                signatures.refresh_signature = process.env.REFRESH_USER_TOKEN_SIGNATURE as string
                break;
        }

        return signatures;
    }

    //_______________________________________________CREATE LOGIN CREDENTIALS
    createLoginCredentials = async (user: UserDocument): Promise<TokenEntity> => {
        console.log({ user });

        const userRole = user.role as RoleEnum
        //--------------------PREFIX (BEARER OR SYSTEM)
        const prefixLevel = await this.detectedPrefix(userRole);
        //--------------------SIGNATURE (ACCESS AND REFRESH)
        const signatures = await this.getSignatures(prefixLevel);
        console.log({ user, prefixLevel, signatures });


        const jwtid = randomUUID()

        const access_token = await this.generateToken({
            payload: {
                sub: user._id,
            },
            options: {
                expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
                secret: signatures.access_signature,
                jwtid
            }
        });


        const refresh_token = await this.generateToken({
            payload: {
                sub: user._id,
            },
            options: {
                secret: signatures.refresh_signature,
                expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                jwtid
            }
        });

        return { access_token, refresh_token };
    }


    //_______________________________________________DECODE TOKEN
    decodedToken = async ({
        authorization,
        tokenType = TokenEnum.access
    }: {
        authorization: string
        tokenType?: TokenEnum
    }): Promise<{ user: UserDocument, decoded: JwtPayload }> => {
        try {
            const [prefix, token] = authorization.split(" ");

            if (!prefix || !token) {
                throw new UnauthorizedException(" Missing token parts");
            }


            const signatures = await this.getSignatures(prefix as PrefixLevelEnum);
            const decoded = await this.verifyToken({
                token,
                options: {
                    secret: tokenType === TokenEnum.refresh
                        ?
                        signatures.refresh_signature
                        :
                        signatures.access_signature
                }

            });

            if (!decoded?.sub || !decoded?.iat) {
                throw new BadRequestException('Invalid token payload');
            }

            if (
                decoded.jti &&
                (await this.tokenRepository.findOne({ filter: { jti: decoded.jti } }))
            ) {
                throw new UnauthorizedException('Invalid or old login credentials');
            }

            const user = await this.userRepository.findOne({
                filter: {
                    _id: decoded.sub,
                }
            }) as UserDocument;
            console.log({ user });




            if (!user) {
                throw new BadRequestException("Not register account")
            };

            if ((user.changeCredentialTime?.getTime() || 0) > decoded.iat * 1000) {
                throw new UnauthorizedException("In-valid or old login credentials");
            }

            return { user, decoded }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(error.message || "something went wrong")
        }
    };

    //_______________________________________________CREATE REVOKE TOKEN
    createRevokeToken = async (decoded: JwtPayload): Promise<TokenDocument> => {

        const [result] = await this.tokenRepository.create({
            data: [{
                jti: decoded?.jti as string,
                expiredAt: new Date((decoded?.iat as number) + Number(process.env.REFRESH_TOKEN_EXPIRES_IN as string)),
                createdBy: Types.ObjectId.createFromHexString(decoded?.sub as string),
            }]
        }) || [];

        if (!result) {
            throw new BadRequestException("Fail to revoke this token")
        };
        return result;
    }
}