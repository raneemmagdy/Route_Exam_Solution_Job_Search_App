import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Exclude, Expose } from "class-transformer";
import { GenderEnum, ProviderEnum, RoleEnum } from "src/Common";
import { UserDocument } from "src/DB"

export class UserResponse {
    user: Partial<UserDocument>
}

export class GetAccountDataEntity {
    @Exclude()
    password: string;

    @Exclude()
    role: string;

    @Exclude()
    isConfirmed: boolean;

    @Exclude()
    _id: string;


    @Exclude()
    provider: ProviderEnum;

    constructor(partial: Partial<UserDocument>) {
        Object.assign(this, partial);
    }
}
export class PathEntity {
    path: string
}




export class ShareProfileEntity {
    @Expose()
    userName: string;

    @Expose()
    mobileNumber: string;

    @Expose()
    profilePic: string;

    @Expose()
    coverPic: string;

    constructor(partial: Partial<UserDocument>) {
        Object.assign(this, partial);
    }
}

//===============================GraphQL===============================

//=====================================Enum
registerEnumType(RoleEnum, {
    name: "RoleEnum",
    description: "Role enum GraphQL",
})
registerEnumType(GenderEnum, {
    name: "GenderEnum",
    description: "Gender enum GraphQL",
})
registerEnumType(ProviderEnum, {
    name: "ProviderEnum",
    description: "Provider enum GraphQL",
})

//===============================================FileResponse
@ObjectType({ description: "File response GraphQL" })
export class FileResponse {
    @Field(() => String, { nullable: true })
    public_id?: string;

    @Field(() => String, { nullable: true })
    secure_url?: string;
}
//===============================================OneUserResponse
@ObjectType({ description: "get One user response GraphQL" })
export class OneUserResponse {
    @Field(() => ID)
    _id: string;

    @Field(() => String)
    firstName: string;

    @Field(() => String)
    lastName: string;

    @Field(() => String, { nullable: true })
    fullName: string;

    @Field(() => String)
    email: string;

    @Field(() => String, { nullable: true })
    mobileNumber?: string;

    @Field(() => RoleEnum)
    role: RoleEnum;

    @Field(() => ProviderEnum)
    provider: ProviderEnum;

    @Field(() => GenderEnum)
    gender: GenderEnum;

    @Field(() => Date, { nullable: true })
    DOB?: Date;

    @Field(() => Boolean, { nullable: true })
    isConfirmed?: boolean;

    @Field(() => Date, { nullable: true })
    deletedAt?: Date;

    @Field(() => Date, { nullable: true })
    bannedAt?: Date;

    @Field(() => Date, { nullable: true })
    changeCredentialTime?: Date;

    @Field(() => FileResponse, { nullable: true })
    profilePic?: FileResponse;

    @Field(() => FileResponse, { nullable: true })
    coverPic?: FileResponse;

}


//===============================================GetAllUserResponse
@ObjectType({ description: "get all user response GraphQL" })
export class GetAllUserResponse {
    @Field(() => Number, { nullable: true })
    docsCount?: number | undefined
    @Field(() => Number, { nullable: true })
    limit?: number | undefined
    @Field(() => Number, { nullable: true })
    currentPage?: number | undefined
    @Field(() => Number, { nullable: true })
    pages?: number | undefined
    @Field(() => [OneUserResponse])
    result: OneUserResponse[] | []
}

