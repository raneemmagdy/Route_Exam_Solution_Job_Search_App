import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, model, Types, UpdateQuery } from 'mongoose';
import { addParanoidHook, createCascadeHook, JobLocationEnum, SeniorityLevelEnum, WorkingTimeEnum } from 'src/Common';
import { Application, ApplicationSchema } from './Application.model';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Job {
    @Prop({ type: String, required: [true, 'Job title is required'] })
    jobTitle: string;

    @Prop({
        type: String,
        required: [true, 'Job location is required'],
        enum: JobLocationEnum
    })
    jobLocation: JobLocationEnum;

    @Prop({
        type: String,
        required: [true, 'Working time is required'],
        enum: WorkingTimeEnum,
    })
    workingTime: WorkingTimeEnum;

    @Prop({
        type: String,
        required: [true, 'Seniority level is required'],
        enum: SeniorityLevelEnum,
    })
    seniorityLevel: SeniorityLevelEnum;

    @Prop({ type: String, required: [true, 'Job description is required'] })
    jobDescription: string;

    @Prop({
        type: [String],
        required: [true, 'Technical skills are required'],
    })
    technicalSkills: string[];

    @Prop({
        type: [String],
        required: [true, 'Soft skills are required'],
    })
    softSkills: string[];

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: [true, 'Added by is required'],
    })
    addedBy: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'User'
    })
    updatedBy?: Types.ObjectId;

    @Prop({ type: Boolean })
    closed?: boolean;

    @Prop({
        type: Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company is required'],
    })
    companyId: Types.ObjectId;
}

// -------------------- Schema --------------------//
export const JobSchema = SchemaFactory.createForClass(Job);
// -------------------- Type --------------------//
export type JobDocument = HydratedDocument<Job>;
// -------------------- Model --------------------//
export const JobModel = MongooseModule.forFeatureAsync([
    {
        name: Job.name,
        useFactory: () => {
            addParanoidHook(JobSchema, 'closed');
            JobSchema.virtual('applications', {
                ref: 'Application',
                localField: '_id',
                foreignField: 'jobId'
            })

            // On Delete Cascade (Soft Delete)
            // JobSchema.pre("updateOne", async function (next) {
            //     const update = this.getUpdate() as UpdateQuery<JobDocument>;
            //     const ApplicationModel = this.model.db.model(Application.name);
            //     if (update.closed) {
            //         const jobId = this.getQuery()._id;
            //         await ApplicationModel.updateMany({ jobId }, { deletedAt: new Date() });
            //     }
            //     next();
            // });

            // On Delete Cascade (Soft Delete)
            createCascadeHook<JobDocument>(
                JobSchema,
                "closed",
                async (jobId, models) => {
                    await models.Application.updateMany(
                        { jobId },
                        { deletedAt: new Date() }
                    );
                }
            );

            return JobSchema;
        },
    }
]
);
