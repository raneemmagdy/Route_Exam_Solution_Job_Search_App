import {IsNotEmpty, IsString } from "class-validator";

export class GoogleDTO  {
    @IsString({ message: 'idToken must be a string' })
    @IsNotEmpty({ message: 'idToken is required' })
    idToken: string
}