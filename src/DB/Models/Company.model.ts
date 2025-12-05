import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import { addParanoidHook, createCascadeHook, NumberOfEmployeeEnum } from 'src/Common';
import { Application, Job, Chat } from './';

import { JobSchema, ApplicationSchema, ChatSchema, UserSchema } from '../Models';


@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Company {

    //***************************************CompanyName */
    @Prop({ type: String, required: [true, 'Company name is required'], unique: [true, 'Company name must be unique'], lowercase: [true, 'Company name must be lowercase'] })
    companyName: string;

    //***************************************Description */
    @Prop({ type: String, required: [true, 'Description is required'] })
    description: string;

    //***************************************Industry */
    @Prop({ type: String, required: [true, 'Industry is required'] })
    industry: string;

    //***************************************Address */
    @Prop({ type: String })
    address?: string;

    //***************************************Number of employees */
    @Prop({ type: String, enum: NumberOfEmployeeEnum, required: true })
    numberOfEmployees: NumberOfEmployeeEnum;

    //***************************************CompanyEmail */
    @Prop({
        required: [true, 'Company email is required'],
        unique: [true, 'Company email must be unique'],
        lowercase: [true, 'Company email must be lowercase'],
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address.'],
    })
    companyEmail: string;

    //***************************************createdBy */
    @Prop({ type: Types.ObjectId, ref: 'User', required: [true, 'createdBy is required'] })
    createdBy: Types.ObjectId;

    //***************************************logo */
    @Prop({
        type: {
            secure_url: String,
            public_id: String,
        },
    })
    logo?: {
        secure_url: string;
        public_id: string;
    };


    //***************************************coverPic */
    @Prop({
        type: {
            secure_url: String,
            public_id: String,
        },
    })
    coverPic?: {
        secure_url: string;
        public_id: string;
    };

    //***************************************HRs */
    @Prop({
        type: [{ type: Types.ObjectId, ref: 'User' }]
    })
    HRs?: Types.ObjectId[];


    //***************************************bannedAt */
    @Prop({ type: Date })
    bannedAt?: Date;

    //***************************************deletedAt */
    @Prop({ type: Date })
    deletedAt?: Date;

    //***************************************legalAttachment */
    @Prop({
        type: {
            secure_url: String,
            public_id: String,
        }
    })
    legalAttachment?: {
        secure_url: string;
        public_id: string;
    };

    //***************************************approvedByAdmin */
    @Prop({ type: Boolean })
    approvedByAdmin?: boolean;
}
// -------------------- Schema --------------------//
export const CompanySchema = SchemaFactory.createForClass(Company);
// -------------------- Type --------------------//
export type CompanyDocument = HydratedDocument<Company>;
// -------------------- Model --------------------//
export const CompanyModel = MongooseModule.forFeatureAsync([{
    name: Company.name,
    useFactory() {
        addParanoidHook(CompanySchema)
        CompanySchema.virtual('jobs', {
            ref: 'Job',
            localField: '_id',
            foreignField: "companyId",
        })



        // On Delete Cascade (Soft Delete)
        // CompanySchema.pre("updateOne", async function (next) {
        //     const update = this.getUpdate() as UpdateQuery<CompanyDocument>;
        //     if (update.deletedAt) {
        //         const companyId = Types.ObjectId.createFromHexString(this.getQuery()._id);

        //         console.log("companyId", companyId);

        //         //Models
        //         const JobModel = this.model.db.model(Job.name);
        //         const ApplicationModel = this.model.db.model(Application.name);
        //         const ChatModel = this.model.db.model(Chat.name);
        //         const CompanyModel = this.model.db.model(Company.name);

        //         //delete applications
        //         const jobs = await JobModel.find({ companyId }).select("_id");
        //         console.log({ jobs });

        //         const jobIds = jobs.map(job => job._id);
        //         console.log({ jobIds });



        //         await ApplicationModel.updateMany({ jobId: { $in: jobIds } }, { deletedAt: new Date() });

        //         //delete chats
        //         const company = await CompanyModel.findById(companyId)
        //         console.log({company});
        //         await ChatModel.updateMany({ senderId: { $in: [...company.HRs, company.createdBy] } }, { deletedAt: new Date() });

        //         //delete jobs
        //         await JobModel.updateMany({ companyId }, { closed: true });


        //     }
        //     next();

        // })

        // On Delete Cascade (Soft Delete)
        createCascadeHook<CompanyDocument>(
            CompanySchema,
            "deletedAt",
            async (companyId, models) => {
                console.log({ models: models.Job });
                companyId = Types.ObjectId.createFromHexString(companyId as unknown as string);
                const jobs = await models.Job.find({ companyId }).select("_id");
                const jobIds = jobs.map((j) => j._id);
                console.log({ jobIds });


                await models.Application.updateMany(
                    { jobId: { $in: jobIds } },
                    { deletedAt: new Date() }
                );

                const company = await models.Company.findById(companyId);

                await models.Chat.updateMany(
                    { senderId: { $in: [...company?.HRs || [], company?.createdBy] } },
                    { deletedAt: new Date() }
                );

                await models.Job.updateMany(
                    { companyId },
                    { closed: true }
                );
            }
        );

        return CompanySchema
    }
}])