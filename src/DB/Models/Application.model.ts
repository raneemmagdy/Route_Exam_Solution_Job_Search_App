import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { addParanoidHook, ApplicationStatusEnum } from 'src/Common';

@Schema({ timestamps: true })
export class Application {

    //*************************************************JobId */
    @Prop({
        type: Types.ObjectId,
        ref: 'Job',
        required: [true, 'JobId is required']
    })
    jobId: Types.ObjectId;

    //*************************************************UserId */
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: [true, 'UserId is required']
    })
    userId: Types.ObjectId;

    //*************************************************UserCV */
    @Prop({
        type: {
            public_id: { type: String, required: true },
            secure_url: { type: String, required: true },
        },
        required: [true, 'UserCV is required']
    })
    userCV: {
        public_id: string;
        secure_url: string;
    };

    //*************************************************Status */
    @Prop({
        type: String,
        enum: ApplicationStatusEnum,
        default: ApplicationStatusEnum.pending
    })
    status?: ApplicationStatusEnum;

    //*************************************************DeletedAt */
    @Prop({ type: Date })
    deletedAt?: Date;
}
//*************************************************Application Document */
export type ApplicationDocument = HydratedDocument<Application>;
//*************************************************Application Schema */
export const ApplicationSchema = SchemaFactory.createForClass(Application);
//*************************************************Application Model */
export const ApplicationModel = MongooseModule.forFeatureAsync([{
    name: Application.name,
    useFactory: () => {
        addParanoidHook(ApplicationSchema);
        return ApplicationSchema;
    },
}]);


