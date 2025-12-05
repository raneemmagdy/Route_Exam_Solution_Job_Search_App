import { ObjectType, Field, ID } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsStrongPassword, Matches, MaxDate, MaxLength, MinDate, MinLength } from "class-validator";
import { GenderEnum, IsMatch, ProviderEnum, RoleEnum } from "src/Common";
import { IsDateInPast } from "src/Common/Decorators/date.custom.decorator";

export class SignupDTO {

    //-------------------- first name --------------------//
    @MinLength(2, { message: 'First name must be at least 2 characters' })
    @MaxLength(20, { message: 'First name must be at most 20 characters' })
    @IsNotEmpty({ message: 'First name is required' })
    firstName: string;

    //-------------------- last name --------------------//
    @MinLength(2, { message: 'Last name must be at least 2 characters' })
    @MaxLength(20, { message: 'Last name must be at most 20 characters' })
    @IsNotEmpty({ message: 'Last name is required' })
    lastName: string;

    //-------------------- email --------------------//
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    //-------------------- password --------------------//
    @IsStrongPassword({}, { message: 'Password must be 8 characters or more and contain at least one lowercase letter, one uppercase letter, one number, and one special character' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;


    //-------------------- Confirm Password --------------------//
    @IsMatch<string>(['password'])
    confirmPassword: string;

    //-------------------- role --------------------//
    @IsEnum(RoleEnum, { message: `Role must be one of ${Object.values(RoleEnum).join(', ')}` })
    @IsOptional()
    role?: RoleEnum;

    //-------------------- gender --------------------//
    @IsEnum(GenderEnum, { message: `Gender must be one of ${Object.values(GenderEnum).join(', ')}` })
    @IsOptional()
    gender?: GenderEnum;

    //-------------------- mobile number --------------------//
    @IsNotEmpty({ message: 'Mobile number is required' })
    @Matches(/^01(1|2|5|0)[0-9]{8}$/, { message: 'Mobile number must be egyptian mobile number eg. 01122264052' })
    mobileNumber: string;

    //-------------------- DOB --------------------//
    @IsNotEmpty({ message: 'Date of birth is required' })
    @IsDate({ message: 'Date of birth must be a valid date' })
    @IsNotEmpty({ message: 'Date of birth is required' })
    @IsDateInPast()
    @MaxDate(() => {
        const now = new Date();
        console.log({  month: now.getMonth(), day: now.getDate() });
        return new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());;
    }, { message: 'Date of birth must be at least 18 years old' })
    @Type(() => Date)
    DOB: Date;
}
