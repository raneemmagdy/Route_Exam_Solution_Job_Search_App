import { Controller, Param, Patch, UsePipes, ValidationPipe } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { Auth, IResponse, MongoDBIdDto, RoleEnum, successResponse, TokenEnum, User } from "src/Common";
import { UserDocument } from "src/DB";

@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    // ----------------------------------------------------------------------banOrUnbanUser
    @Patch('/user/:id/ban-or-unban')
    @Auth([ RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async banOrUnbanUser(
        @Param() param: MongoDBIdDto,
        @User() user: UserDocument,
    ): Promise<IResponse> {
        const message = await this.adminService.banOrUnbanUser(param, user)
        return successResponse({ data: { message } })
    }
    // ----------------------------------------------------------------------banOrUnbanCompany
    @Patch('/company/:id/ban-or-unban')
    @Auth([ RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async banOrUnbancompany(
        @Param() param: MongoDBIdDto,
    ): Promise<IResponse> {
        const message = await this.adminService.banOrUnbanCompany(param)
        return successResponse({ data: { message } })
    }
    // ----------------------------------------------------------------------approveCompany
    @Patch('/company/:id/approve')
    @Auth([ RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async approveCompany(
        @Param() param: MongoDBIdDto,
        @User() user: UserDocument,
    ): Promise<IResponse> {
        const message = await this.adminService.approveCompany(param, user)
        return successResponse({ data: { message } })
    }


}