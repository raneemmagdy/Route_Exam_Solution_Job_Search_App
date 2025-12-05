import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Res, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { CredentialsResponse } from "./Entity/auth.entity";
import { AuthService } from "./auth.service";
import { ConfirmOtpDTO, loginDTO, SignupDTO, GoogleDTO, SendOtpDTO, ResetPasswordDTO } from "./DTO";
import { Auth, AuthenticationGuard, Decoded, IResponse, RoleEnum, successResponse, Token, TokenEnum, User } from "src/Common";
import { UserDocument } from "src/DB";
import { JwtPayload } from './../../../node_modules/@types/jsonwebtoken/index.d';
import type { Response } from "express";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }
    // -----------------------------------------Signup--------------------------------------------
    @Post('signup')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async signup(@Body() body: SignupDTO): Promise<IResponse> {
        const message = await this.authService.signup(body)
        return successResponse({ message, statusCode: HttpStatus.CREATED })
    }

    // -----------------------------------------Confirm Otp--------------------------------------------
    @Patch('confirm-otp')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async confirmOtp(@Body() body: ConfirmOtpDTO): Promise<IResponse> {
        const message = await this.authService.confirmOtp(body)
        return successResponse({ message })
    }

    // -----------------------------------------Login--------------------------------------------
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async login(@Body() body: loginDTO): Promise<IResponse<CredentialsResponse>> {
        const credentials = await this.authService.login(body)
        return successResponse<CredentialsResponse>({ data: { credentials } })
    }
    // -----------------------------------------refreshToken--------------------------------------------
    @Post('refresh-token')
    // @Token(TokenEnum.refresh)
    // @UseGuards(AuthenticationGuard)
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.refresh)
    async refreshToken(@User() user: UserDocument, @Decoded() decoded: JwtPayload): Promise<IResponse<CredentialsResponse>> {
        const credentials = await this.authService.refreshToken(user, decoded)
        return successResponse<CredentialsResponse>({ data: { credentials } })

    }



    //------------------------------------------signupGoogle--------------------------------------------
    @Post('signup/gmail')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async googleSignup(@Body() body: GoogleDTO): Promise<IResponse> {
        const message = await this.authService.googleSignup(body)
        return successResponse({ message, statusCode: 201 })
    }
    //------------------------------------------loginGoogle--------------------------------------------
    @Post('login/gmail')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async googleLogin(@Body() body: GoogleDTO): Promise<IResponse<CredentialsResponse>> {
        const credentials = await this.authService.googleLogin(body)
        return successResponse<CredentialsResponse>({ data: { credentials } })
    }
    //------------------------------------------loginGoogle&signupGoogle--------------------------------------------
    @Post('/google')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async googleSignupAndLogin(@Body() body: GoogleDTO, @Res() res: Response): Promise<Response> {
        const { credentials, isNew } = await this.authService.googleSignupAndLogin(body)
        // return { message: "Done", data: { credentials } }
        return res.status(
            isNew ? HttpStatus.CREATED : HttpStatus.OK
        ).json({ message: "Done", statusCode: isNew ? 201 : 200, data: { credentials } })
    }

    // -----------------------------------------sendOtp--------------------------------------------
    @Patch('send-otp')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async sendOtp(@Body() body: SendOtpDTO): Promise<IResponse> {
        const message = await this.authService.sendOtp(body)
        return successResponse({ message })
    }
    // -----------------------------------------Reset Password--------------------------------------------
    @Patch('reset-password')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async resetPassword(@Body() body: ResetPasswordDTO): Promise<IResponse> {
        const message = await this.authService.resetPassword(body)
        return successResponse({ message })
    }




}