import { ChatDocument, CompanyRepository, UserDocument, UserRepository } from 'src/DB';
import { ChatRepository } from './../../DB/Repository/chat.repository';
import { ForbiddenException, Injectable, NotFoundException, Type } from "@nestjs/common";
import { MongoDBIdDto } from 'src/Common';
import { Types } from 'mongoose';
import { IAuthSocket } from '../gateway/gateway';

@Injectable()
export class ChatService {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly UserRepository: UserRepository,
        private readonly companyRepository: CompanyRepository,
    ) { }
    //-----------------------------------------------------------------------get Chat
    async getChat(param: MongoDBIdDto, user: UserDocument): Promise<ChatDocument> {
        const { id: userId } = param
        const userExist = await this.UserRepository.findOne({ filter: { _id: userId } })
        if (!userExist) {
            throw new NotFoundException('user not found or deleted');
        }
        console.log({userExist});
        
        const chat = await this.chatRepository.findOne({
            filter: {
                $or: [
                    { senderId: user._id, receiverId: new Types.ObjectId(userId) },
                    { receiverId: user._id, senderId: new Types.ObjectId(userId) }
                ]
            }
        })
        if (!chat) {
            throw new NotFoundException('Chat not found or deleted');
        }
        return chat
    }

    //-----------------------------------------------------------------------send Message
    async sendMessage(senderId: Types.ObjectId, receiverId: Types.ObjectId, message: string,client: IAuthSocket): Promise<ChatDocument> {
        console.log({senderId, receiverId, message})
        let chat = await this.chatRepository.findOne({
            filter: {
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }
        });

        if (!chat) {
            const company = await this.companyRepository.findOne({
                filter: {
                    $or: [{ createdBy: senderId }, { HRs: senderId }]
                }
            });
            console.log({company})
            if (!company) {
                console.log("done")
                client.emit('exception', { message: 'Only HRs or company owners can start a conversation.'});
                // throw new ForbiddenException('Only HRs or company owners can start a conversation.');
            }

            [chat] = await this.chatRepository.create({
                data: [
                    { senderId, receiverId ,messages: []}
                ]
            }) || [];
        }
        console.log({chat})

        chat.messages.push({ senderId, message });
        console.log({chat})

        await chat.save();

        return chat
    }


}