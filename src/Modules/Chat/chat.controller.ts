import { Controller, Get, Param, UsePipes, ValidationPipe } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Auth, IResponse, MongoDBIdDto, RoleEnum, successResponse, TokenEnum, User } from "src/Common";
import { UserDocument } from "src/DB";
import { ChatResponse } from "./Entity/chat.entity";

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ) { }
    // ----------------------------------------------------------------------Get Chat
    @Get(':id')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async updateCompany( @Param() param: MongoDBIdDto, @User() user: UserDocument): Promise<IResponse<ChatResponse>> {
        const chat = await this.chatService.getChat(param, user);
        return successResponse<ChatResponse>({ data: { chat } })
    }
}