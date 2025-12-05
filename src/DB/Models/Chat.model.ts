import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';


@Schema({
    timestamps: true,
})
export class Chat {

    //*********************************************SenderId */
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: [true, 'SenderId is required'],
    })
    senderId: Types.ObjectId;

    //*********************************************ReceiverId */
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: [true, 'ReceiverId is required'],
    })
    receiverId: Types.ObjectId;

    //*********************************************DeletedAt */
    @Prop({ type: Date })
    deletedAt?: Date;

    //*********************************************Messages */
    @Prop([
        {
            message: { type: String, required: [true, 'Message is required'] },
            senderId: { type: Types.ObjectId, ref: 'User' },
        },
    ])
    messages: {
        message: string;
        senderId: Types.ObjectId;
    }[];
}
// -------------------- Schema --------------------//
export const ChatSchema = SchemaFactory.createForClass(Chat);
// -------------------- Type --------------------//
export type ChatDocument = HydratedDocument<Chat>;
// -------------------- Model --------------------//
export const ChatModel = MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }])
