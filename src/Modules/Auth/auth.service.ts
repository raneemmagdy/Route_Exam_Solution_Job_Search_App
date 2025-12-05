import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository, OtpRepository, UserDocument } from "src/DB";
import { GoogleDTO, ConfirmOtpDTO, loginDTO, SignupDTO, SendOtpDTO, ResetPasswordDTO } from "./DTO";
import { Types } from "mongoose";
import { GooglePayload, compareHash, emailEvent, generateHash, generateOtp, OtpEnum, ProviderEnum, TokenEntity, TokenService } from "src/Common";
import { JwtPayload } from './../../../node_modules/@types/jsonwebtoken/index.d';
import { OAuth2Client } from "google-auth-library";
import { CredentialsAndFlag } from "./Entity/auth.entity";

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly otpRepository: OtpRepository,
        private readonly tokenService: TokenService,
    ) {
        this.client = new OAuth2Client(process.env.CLIENT_ID);
    }
    //-----------------------------------------Google Client--------------------------------------------
    private client: OAuth2Client;
    //-----------------------------------------Create Otp--------------------------------------------
    private async createOtp(userId: Types.ObjectId, otp: string,type:OtpEnum): Promise<void> {
        await this.otpRepository.create({
            data: [
                {
                    code: otp,
                    expiredIn: new Date(Date.now() + 10 * 60 * 1000),
                    createdBy: userId,
                    type,
                },
            ],
        })
    }

    //-----------------------------------------Signup--------------------------------------------
    async signup(body: SignupDTO): Promise<string> {
        const { firstName, lastName, email, password, role, gender, mobileNumber, DOB } = body
        console.log(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000));
        
        if (await this.userRepository.emailExist(email)) {
            throw new ConflictException('user already exists');
        }
        const [user] = await this.userRepository.create({
            data: [
                {
                    firstName,
                    lastName,
                    email,
                    password,
                    role,
                    gender,
                    mobileNumber,
                    DOB
                },
            ],
        }) || [];

        if (!user) {
            throw new BadRequestException('failed to create user');
        }
        const otp = generateOtp()
        await this.createOtp(user._id, await generateHash(otp),OtpEnum.ConfirmEmail);
        emailEvent.emit('otpEmail', { title: 'Email Verification Code', subject: 'Confirm Email Verification', otp, to: email });
        return "user created successfully"
    }

    //-----------------------------------------Confirm Otp--------------------------------------------
    async confirmOtp(body: ConfirmOtpDTO): Promise<string> {

        const { email, otp } = body
        const user = await this.userRepository.findOne({
            filter: { email, isConfirmed: { $exists: false } },
            options: {
                populate: [{ path: 'otp', match: { type: OtpEnum.ConfirmEmail } }]
            }
        })

        console.log({ user });

        if (!user) {
            throw new BadRequestException('User does not exist Or already verified');
        }
        if (!user.otp.length) {
            throw new BadRequestException('Otp not found');
        }
        if (user.otp[0].expiredIn.getTime() < Date.now()) {
            throw new BadRequestException('Otp Expired');
        }
        if (!await compareHash(otp, user.otp[0].code)) {
            throw new BadRequestException('Invalid Otp');
        }
        await this.userRepository.updateOne({ filter: { _id: user._id }, update: { isConfirmed: true } })
        await this.otpRepository.deleteOne({ filter: { _id: user.otp[0]._id } })
        return "account verified successfully"
    }


    //-----------------------------------------Login--------------------------------------------
    async login(body: loginDTO): Promise<TokenEntity> {

        const { email, password } = body
        const user = await this.userRepository.findOne({
            filter: { email, isConfirmed: { $exists: true }, provider: ProviderEnum.system },
        })
        if (!user) {
            throw new BadRequestException('invalid credentials or not confirmed');
        }
        if (!await compareHash(password, user.password)) {
            throw new BadRequestException('invalid credentials');
        }
        return await this.tokenService.createLoginCredentials(user)
    }
    //-----------------------------------------refreshToken--------------------------------------------
    async refreshToken(user: UserDocument, decoded: JwtPayload): Promise<TokenEntity> {
        const credentials = await this.tokenService.createLoginCredentials(user)
        await this.tokenService.createRevokeToken(decoded);
        return credentials
    }
    //-----------------------------------------verifyToken Google-------------------------------------------- 
    private async verify(idToken: string): Promise<GooglePayload | undefined> {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,
        })
        const payload = ticket.getPayload();
        return payload as GooglePayload;
    }

    //-----------------------------------------Google signup--------------------------------------------
    async googleSignup(body: GoogleDTO): Promise<string> {
        const { idToken } = body
        console.log(idToken, body);

        const payload = await this.verify(idToken);
        if (!payload?.email_verified) {
            throw new BadRequestException('not verified account');
        }
        const user = await this.userRepository.emailExist(payload.email);
        if (user) {
            throw new ConflictException('email already exists');
        }
        await this.userRepository.create({
            data: [
                {
                    email: payload.email,
                    firstName: payload.given_name,
                    lastName: payload.family_name,
                    provider: ProviderEnum.google,
                    isConfirmed: true
                },
            ],
        })
        return "user created successfully"

    }

    //-----------------------------------------Google Login--------------------------------------------
    async googleLogin(body: GoogleDTO): Promise<TokenEntity> {
        const { idToken } = body
        const payload = await this.verify(idToken);
        if (!payload) {
            throw new BadRequestException('invalid credentials');
        }
        const user = await this.userRepository.findOne({
            filter: { email: payload.email, isConfirmed: { $exists: true }, provider: ProviderEnum.google },
        })
        if (!user) {
            throw new BadRequestException('invalid credentials');
        }
        return await this.tokenService.createLoginCredentials(user);
    }

    //-----------------------------------------Google signup & login--------------------------------------------
    async googleSignupAndLogin(body: GoogleDTO): Promise<CredentialsAndFlag> {
        const { idToken } = body
        const payload = await this.verify(idToken);
        if (!payload?.email_verified) {
            throw new BadRequestException('not verified account');
        }
        const user = await this.userRepository.findOne({
            filter: { email: payload.email },
        });
        if (user) {
            if (user?.provider === ProviderEnum.google) {
                // return await this.tokenService.createLoginCredentials(user);
                return { credentials: await this.googleLogin(body), isNew: false };
            }
            throw new ConflictException('email already exists');
        }
        const [newUser] = await this.userRepository.create({
            data: [
                {
                    email: payload.email,
                    firstName: payload.given_name,
                    lastName: payload.family_name,
                    provider: ProviderEnum.google,
                    isConfirmed: true
                },
            ],
        }) || []
        // return await this.tokenService.createLoginCredentials(newUser);
        const credentials = await this.tokenService.createLoginCredentials(newUser);
        return { credentials, isNew: true };
    }


    //--------------------------------------------SendOTP------------------------------------------------
    async sendOtp(body: SendOtpDTO): Promise<string> {
        const { email } = body;

        const user = await this.userRepository.findOne({
            filter: { email, isConfirmed: { $exists: true }, provider: ProviderEnum.system },
            options: { populate: [{ path: 'otp', match: { type: OtpEnum.ResetPassword } }] },
        });

        if (!user) {
            throw new NotFoundException('Invalid account: not registered, not confirmed, or wrong provider');
        }
        console.log({user:user.otp});
        
        if (user.otp.length) {
            throw new BadRequestException('Otp already sent to your email and is not expired');
        }

        const otp = generateOtp()
        await this.createOtp(user._id, await generateHash(otp), OtpEnum.ResetPassword);
        emailEvent.emit('otpEmail', { title: 'forget Password Code', subject: 'Forget Password', otp, to: email });
        return "otp sent successfully"
    }

    //--------------------------------------------ResetPassword------------------------------------------------
    async resetPassword(body: ResetPasswordDTO): Promise<string> {
        const { email, otp, password } = body;

        const user = await this.userRepository.findOne({
            filter: { email },
            options: {
                populate: [{ path: 'otp', match: { type: OtpEnum.ResetPassword } }]
            },
        });
        if (!user?.otp.length) {
            throw new ConflictException('Otp not found');
        }
        if (user.otp[0].expiredIn.getTime() < Date.now()) {
            throw new ConflictException('Otp expired');
        }

        if (! await compareHash(otp, user.otp[0].code)) {
            throw new ConflictException('Invalid Otp code');
        }

        const result = await this.userRepository.updateOne({
            filter: { email },
            update: {
                password: await generateHash(password),
                changeCredentialTime: new Date(),
            },
        });

        if (!result.matchedCount) {
            throw new BadRequestException('Failed to reset password');
        }

        await this.otpRepository.deleteOne({ filter: { _id: user.otp[0]._id } });

        return 'Password reset successfully';
    }
}





