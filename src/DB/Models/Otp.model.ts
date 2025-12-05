import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { OtpEnum } from "src/Common";


@Schema()
export class Otp {

    //********************************Code */
    @Prop({ type: String, required: [true, 'Code is required'] })
    code: string;
    
    //********************************ExpiredIn */
    @Prop({ type: Date, required: [true, 'ExpiredIn is required'] })
    expiredIn: Date

    //********************************Created By */
    @Prop({ type: Types.ObjectId, ref: "User", required: [true, 'createdBy is required'] })
    createdBy: Types.ObjectId

    //********************************Type */
    @Prop({ type: String, enum: OtpEnum, required: [true, 'Type is required'] })
    type: OtpEnum
}


// -------------------- Schema --------------------//
export const OtpSchema = SchemaFactory.createForClass(Otp);
// -------------------- Type --------------------//
export type OtpDocument = HydratedDocument<Otp>;
// -------------------- Model --------------------//
export const OtpModel = MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]);
// -------------------- TTL --------------------//
// OtpSchema.index({ expiredIn: 1 }, { expireAfterSeconds: 0 });