import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { JwtPayload } from './../../../node_modules/@types/jsonwebtoken/index.d';
import { Socket, Server } from "socket.io";
import { Auth, reachToken, RoleEnum, TokenEnum, TokenService } from "src/Common";
import { connectedUsers, UserDocument } from "src/DB";
import { UsePipes, ValidationPipe } from "@nestjs/common";
import { SendMessageDTO } from "../Chat/DTO/send-message.dto";
import { ChatService } from "../Chat/chat.service";
import { Types } from "mongoose";


export interface IAuthSocket extends Socket {
    credential: {
        user: UserDocument,
        decoded: JwtPayload
    }
}
@WebSocketGateway({
    cors: {
        origin: "*"
    },
    namespace: 'realtime'
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server

    constructor(
        private readonly tokenService: TokenService,
        private readonly chatService: ChatService
    ) { }

    afterInit() {
        console.log("RealtimeGateway Started 👌");
    }
    async handleConnection(client: IAuthSocket): Promise<void> {
        try {
            console.log(`client connected ${client.id}`);
            const authorization = reachToken(client)
            const { user, decoded } = await this.tokenService.decodedToken({ authorization, tokenType: TokenEnum.access })
            connectedUsers.set(user._id.toString(), client.id)
            client.credential = { user, decoded }
        } catch (error) {
            client.emit('exception', error)
        }

    }
    handleDisconnect(client: IAuthSocket) {
        console.log(`client disConnected ${client.id}`);
        connectedUsers.delete(client.credential.user._id.toString())
    }

    // emitStockChanges(data: { productId: Types.ObjectId, stock: number } | { productId: Types.ObjectId, stock: number }[]): void {
    //     try {
    //         this.server.emit('changeStock', data)
    //     } catch (error) {
    //         this.server.emit('error', error)
    //     }
    // }

    @SubscribeMessage('sendMessage')
    @Auth([RoleEnum.User], TokenEnum.access)
    @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
    async onSendMessage(@MessageBody() data: SendMessageDTO, @ConnectedSocket() client: IAuthSocket) {
        try {
            const senderId = client.credential.user._id
            const { message, receiverId } = data
            console.log({ message, receiverId , senderId});
            const chat = await this.chatService.sendMessage(senderId, Types.ObjectId.createFromHexString(receiverId), message, client);
            const receiverSocketId = connectedUsers.get(receiverId.toString());
            if (receiverSocketId) {
                client.to(receiverSocketId).emit('receiveMessage', { senderId, message: message, chatId: chat._id });
            }
            client.emit('messageSent', { message: message, receiverId: receiverId, chatId: chat._id });
        } catch (error) {
            client.emit('exception', { message: error.message });
        }
    }

}