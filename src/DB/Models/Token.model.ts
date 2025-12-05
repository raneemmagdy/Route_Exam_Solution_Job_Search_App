import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


@Schema({
    timestamps: true,

})
export class Token {

    //==================================JTI==================================
    @Prop({
        type: String,
        required: true,
        unique:true
    })
    jti: string

    //==================================EXPIREDATE==================================
    @Prop({
        type: String,
        required: true,
    })
    expiredAt: Date

    //==================================CREATEDBY==================================
    @Prop({
        type: Types.ObjectId,
        required: true,
        ref:"User"
    })
    createdBy:Types.ObjectId

};

// ==================================Type==================================
export type TokenDocument = HydratedDocument<Token> 
// ==================================Schema==================================
export const TokenSchema = SchemaFactory.createForClass(Token);
TokenSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });


// ==================================Model==================================
export const TokenModel = MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }])