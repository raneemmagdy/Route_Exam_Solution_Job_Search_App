import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApplicationService } from "./application.service";
import { Auth, cloudMulterOptions, DocumentAllowedExtensions, IResponse, MongoDBIdDto, PaginationDto, RoleEnum, successResponse, TokenEnum, User } from "src/Common";
import { UserDocument } from "src/DB";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApplicationResponse } from "./Entity/application.entity";
import { JobMongoDBIdDTO } from "../Job/DTO";
import { ApplicationStatusDTO } from "./DTO/application-status.dto";
import { GetAllResponse } from "src/Common/Entity/pagination.entity";
import { DateDTO } from "./DTO";
import { PathEntity } from "../User/Entity/user.entity";

@Controller('application')
export class ApplicationController {
    constructor(
        private readonly applicationService: ApplicationService
    ) { }
    // ----------------------------------------------------------------------Generate Excel Report
    @Post(":id/report")
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async generateExcelReport(@Param() param: MongoDBIdDto, @User() user: UserDocument, @Body() body: DateDTO)
        : Promise<IResponse<PathEntity>> {
        const url = await this.applicationService.generateExcelReport(param, user, body);
        return successResponse<PathEntity>({ data: { url } })
    }
    // ----------------------------------------------------------------------apply job
    @Post(":jobId")
    @Auth([RoleEnum.User], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @UseInterceptors(FileInterceptor('userCV', cloudMulterOptions({ validation: [DocumentAllowedExtensions[0]], fileSize: 1024 * 1024 * 5 })))
    async applyJob(
        @Param() param: JobMongoDBIdDTO,
        @User() user: UserDocument,
        @UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: Express.Multer.File,
    ): Promise<IResponse<ApplicationResponse>> {
        const application = await this.applicationService.applyJob(param, user, file);
        return successResponse<ApplicationResponse>({ data: { application } , statusCode: HttpStatus.CREATED})
    }
    // ----------------------------------------------------------------------Application status
    @Patch(":id/status")
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async applicationStatus(@Body() body: ApplicationStatusDTO, @Param() param: MongoDBIdDto, @User() user: UserDocument): Promise<IResponse> {
        const status = await this.applicationService.applicationStatus(body, param, user);
        return successResponse({ data: { status } })
    }
    // ----------------------------------------------------------------------get all applications for specific job
    @Get(":id")
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async getAllApplications(@Query() query: PaginationDto, @Param() param: MongoDBIdDto, @User() user: UserDocument)
        : Promise<IResponse<GetAllResponse<ApplicationResponse>>> {
        const application = await this.applicationService.getAllApplications(query, param, user);
        return successResponse<GetAllResponse<ApplicationResponse>>({ data: { application } })
    }

}