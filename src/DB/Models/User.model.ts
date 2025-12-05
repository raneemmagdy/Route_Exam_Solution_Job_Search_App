import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import { addParanoidHook, createCascadeHook, encrypt, GenderEnum, generateHash, ProviderEnum, RoleEnum } from "src/Common";
import { OtpDocument } from "./Otp.model";
import { Application, Job, Chat, Company } from './';



@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false
})
export class User {

    //*******************************firstName */
    @Prop({ type: String, required: [true, 'First name is required'], minLength: [2, 'First name must be at least 2 characters'], maxLength: [20, 'First name must be at most 20 characters'] })
    firstName: string;
    //*******************************lastName */
    @Prop({ type: String, required: [true, 'Last name is required'], minLength: [2, 'Last name must be at least 2 characters'], maxLength: [20, 'Last name must be at most 20 characters'] })
    lastName: string;
    //*******************************fullName */
    @Virtual(
        {
            get: function (this: User) {
                return this.firstName + " " + this.lastName
            },
            set: function (value: string) {
                const [firstName, lastName] = value.split(' ') || [];
                this.set({ firstName, lastName });
            }
        }
    )
    fullName: string


    //*******************************email */
    @Prop({
        type: String,
        required: [true, 'Email is required'],
        lowercase: [true, 'Email must be lowercase'],
        unique: [true, 'Email must be unique'],
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address.'],
    })
    email: string;

    //*******************************password */
    @Prop({
        type: String,
        minlength: [8, 'Password must be at least 8 characters'],
        required: function () {
            return this.provider === ProviderEnum.system;
        },
    })
    password: string;
    //*******************************provider */
    @Prop({
        type: String,
        enum: ProviderEnum,
        default: ProviderEnum.system,
    })
    provider: ProviderEnum;
    //*******************************gender */
    @Prop({
        type: String,
        enum: GenderEnum,
        default: GenderEnum.Male,
    })
    gender: GenderEnum;
    //*******************************DOB */
    @Prop({
        type: Date,
        required: function () {
            return this.provider === ProviderEnum.system;
        },
        validate: {
            validator: (value: Date) => {
                const now = new Date();
                const minDate = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
                console.log({ minDate, month: now.getMonth(), day: now.getDate() });

                return value <= minDate;
            },
            message: 'User must be at least 18 years old.',
        }

    })
    DOB: Date;
    //*******************************mobileNumber */
    @Prop({
        type: String,
        required: function () {
            return this.provider === ProviderEnum.system;
        },
    })
    mobileNumber: string;
    //*******************************role */
    @Prop({
        type: String,
        enum: RoleEnum,
        default: RoleEnum.User,
    })
    role: string;
    //*******************************isConfirmed */
    @Prop({
        type: Boolean
    })
    isConfirmed?: boolean;
    //*******************************deletedAt */
    @Prop({ type: Date })
    deletedAt?: Date;
    //*******************************bannedAt */
    @Prop({ type: Date })
    bannedAt?: Date;
    //*******************************updatedBy */
    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;
    //*******************************changeCredentialTime */
    @Prop({ type: Date })
    changeCredentialTime?: Date;
    //*******************************profilePic */
    @Prop({
        type: {
            public_id: String,
            secure_url: String,
        },
    })
    profilePic?: { public_id: string; secure_url: string };
    //*******************************coverPic */
    @Prop({
        type: {
            public_id: String,
            secure_url: String,
        },
    })
    coverPic?: { public_id: string; secure_url: string };

    //*******************************OTP */
    @Virtual()
    otp: OtpDocument[]
}
// -------------------- Schema --------------------//
export const UserSchema = SchemaFactory.createForClass(User);
// -------------------- Type --------------------//
export type UserDocument = HydratedDocument<User>;
// -------------------- Model --------------------//
export const UserModel = MongooseModule.forFeatureAsync([{
    name: User.name,
    useFactory() {

        UserSchema.pre('save', async function (next) {
            if (this.isModified('password')) {
                this.password = await generateHash(this.password);
            }
            if (this.isModified('mobileNumber')) {
                this.mobileNumber = await encrypt({ plainText: this.mobileNumber });
            }
            next()
        })
        UserSchema.virtual("otp", {
            localField: "_id",
            foreignField: "createdBy",
            ref: "Otp"
        }),

            addParanoidHook(UserSchema)

        // On Delete Cascade (Soft Delete)
        // UserSchema.pre("updateOne", async function (next) {
        //     const update = this.getUpdate() as UpdateQuery<UserDocument>;

        //     if (update.deletedAt) {
        //         const userId = this.getQuery()._id;
        //         console.log({userId});

        //         //Models
        //         const JobModel = this.model.db.model(Job.name);
        //         const ApplicationModel = this.model.db.model(Application.name);
        //         const ChatModel = this.model.db.model(Chat.name);
        //         const CompanyModel = this.model.db.model(Company.name);
        //         //delete applications
        //         await ApplicationModel.updateMany({ userId }, { deletedAt: new Date() });
        //         //delete chats
        //         await ChatModel.updateMany({
        //             $or: [{ senderId: userId }, { receiverId: userId }]
        //         }, { deletedAt: new Date() });
        //         //delete jobs
        //         await JobModel.updateMany({ addedBy: userId }, { closed: true });
        //         //delete companies
        //         await CompanyModel.updateMany({ createdBy: userId }, { deletedAt: new Date() });

        //     }

        //     next();
        // });



        // On Delete Cascade (Soft Delete)
        createCascadeHook<UserDocument>(
            UserSchema,
            "deletedAt",
            async (userId, models) => {
                await models.Application.updateMany({ userId }, { deletedAt: new Date() });

                await models.Chat.updateMany(
                    { $or: [{ senderId: userId }, { receiverId: userId }] },
                    { deletedAt: new Date() }
                );

                await models.Job.updateMany(
                    { addedBy: userId },
                    { closed: true }
                );

                await models.Company.updateMany(
                    { createdBy: userId },
                    { deletedAt: new Date() }
                );
            }
        );

        return UserSchema
    }
}])
export const connectedUsers = new Map<string, string>()