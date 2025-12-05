import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseFilePipe, Patch, Query, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateAccountDTO, UpdatePasswordDTO } from "./DTO";
import { Auth, cloudMulterOptions, ImageAllowedExtensions, IResponse, MongoDBIdDto, PaginationGraphDto, RoleEnum, successResponse, TokenEnum, User } from "src/Common";
import { UserDocument } from "src/DB";
import { GetAccountDataEntity, PathEntity, UserResponse } from "./Entity/user.entity";
import { Types } from "mongoose";
import { FileInterceptor } from "@nestjs/platform-express";
import { GetAllResponse } from "src/Common/Entity/pagination.entity";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }
    // -----------------------------------------Get All Users Chat--------------------------------------------
    @Get('/all')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async findAllChat(@Query() query: PaginationGraphDto): Promise<IResponse<GetAllResponse<UserDocument>>> {
        const users = await this.userService.findAllChat(query)
        return successResponse<GetAllResponse<UserDocument>>({ data: users })
    }
    // -----------------------------------------Update User Account--------------------------------------------
    @Patch('/account')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async updateAccount(@Body() body: UpdateAccountDTO, @User() user: UserDocument): Promise<IResponse<UserResponse>> {
        const updateUser = await this.userService.updateAccount(body, user)
        return successResponse<UserResponse>({ data: { user: updateUser } })
    }
    // -----------------------------------------Get Account (logged in user)--------------------------------------------
    @Get('/account')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UseInterceptors(ClassSerializerInterceptor)
    async getAccount(@User() user: UserDocument): Promise<IResponse<GetAccountDataEntity>> {
        const loggedInUser = await this.userService.getAccount(user)
        return successResponse<GetAccountDataEntity>({ data: { user: loggedInUser } })
    }
    // -----------------------------------------Share account--------------------------------------------
    @Get('/:id')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async shareAccount(@Param() id: MongoDBIdDto): Promise<IResponse<UserResponse>> {
        const user = await this.userService.shareAccount(id)
        return successResponse<UserResponse>({ data: { user } })
    }
    // -----------------------------------------Update Password--------------------------------------------
    @Patch('/password')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async updatePassword(@Body() body: UpdatePasswordDTO, @User() user: UserDocument): Promise<IResponse> {
        const message = await this.userService.updatePassword(body, user)
        return successResponse({ message })
    }
    // -----------------------------------------Delete Account--------------------------------------------
    @Delete()
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    async deleteAccount(@User() user: UserDocument): Promise<IResponse> {
        const message = await this.userService.deleteAccount(user)
        return successResponse({ message })
    }
    // -----------------------------------------upload profile pic--------------------------------------------
    @Patch('/profile-pic')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UseInterceptors(FileInterceptor('profilePic', cloudMulterOptions({ validation: ImageAllowedExtensions, fileSize: 1024 * 1024 * 5 })))
    async uploadProfilePic(
        @UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: Express.Multer.File,
        @User() user: UserDocument): Promise<IResponse<PathEntity>> {
        const path = await this.userService.uploadProfilePic(file, user)
        return successResponse<PathEntity>({ data: { path } })
    }
    // -----------------------------------------upload Cover pic--------------------------------------------
    @Patch('/cover-pic')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UseInterceptors(FileInterceptor('coverPic', cloudMulterOptions({ validation: ImageAllowedExtensions, fileSize: 1024 * 1024 * 5 })))
    async uploadCoverPic(
        @UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: Express.Multer.File,
        @User() user: UserDocument): Promise<IResponse<PathEntity>> {
        const path = await this.userService.uploadCoverPic(file, user)
        return successResponse<PathEntity>({ data: { path } })
    }
    // -----------------------------------------delete Profile pic--------------------------------------------
    @Delete('/profile-pic')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    async deleteProfilePic(@User() user: UserDocument): Promise<IResponse> {
        const message = await this.userService.deleteProfilePic(user)
        return successResponse({ message })
    }
    // -----------------------------------------delete Cover pic--------------------------------------------
    @Delete('/cover-pic')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    async deleteCoverPic(@User() user: UserDocument): Promise<IResponse> {
        const message = await this.userService.deleteCoverPic(user)
        return successResponse({ message })
    }
    


}