import { Body, Controller, Delete, Get, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { CompanyService } from "./company.service";
import { Auth, cloudMulterOptions, DocumentAllowedExtensions, ImageAllowedExtensions, IResponse, MongoDBIdDto, RoleEnum, successResponse, TokenEnum, User } from "src/Common";
import { AddCompanyDTO, SearchByNameDTO, UpdateCompanyDTO } from "./DTO";
import { UserDocument } from "src/DB";
import { CompanyResponse } from "./Entity/company.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { PathEntity } from "../User/Entity/user.entity";

@Controller("company")
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService
    ) { }
    // ----------------------------------------------------------------------add company
    @Post()
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @UseInterceptors(FileInterceptor('legalAttachment', cloudMulterOptions({ validation: [...ImageAllowedExtensions, DocumentAllowedExtensions[0]], fileSize: 1024 * 1024 * 5 })))
    async addCompany(
        @Body() body: AddCompanyDTO,
        @User() user: UserDocument,
        @UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: Express.Multer.File,

    ): Promise<IResponse<CompanyResponse>> {
        const company = await this.companyService.addCompany(body, user, file);
        return successResponse<CompanyResponse>({ data: { company } })
    }

    // ----------------------------------------------------------------------update company
    @Patch(':id')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async updateCompany(@Body() body: UpdateCompanyDTO, @Param() param: MongoDBIdDto, @User() user: UserDocument): Promise<IResponse<CompanyResponse>> {
        const company = await this.companyService.updateCompany(body, param, user);
        return successResponse<CompanyResponse>({ data: { company } })
    }
    // ----------------------------------------------------------------------delete company
    @Delete(':id')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async deleteCompany(@Param() param: MongoDBIdDto, @User() user: UserDocument): Promise<IResponse> {
        const message = await this.companyService.deleteCompany(param, user);
        return successResponse({ message })
    }
    // ----------------------------------------------------------------------Search By Company Name
    @Get()
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async searchByCompanyName(@Query() query: SearchByNameDTO): Promise<IResponse<CompanyResponse>> {
        const company = await this.companyService.searchByCompanyName(query);
        return successResponse<CompanyResponse>({ data: { company } })
    }
     // ----------------------------------------------------------------------get specific company
    @Get(':id')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async getSpecificCompany( @Param() param: MongoDBIdDto): Promise<IResponse<CompanyResponse>> {
        const company = await this.companyService.getSpecificCompany(param);
        return successResponse<CompanyResponse>({ data: { company } })
    }
    // -----------------------------------------upload company logo--------------------------------------------
    @Patch('/:id/logo')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @UseInterceptors(FileInterceptor('logo', cloudMulterOptions({ validation: ImageAllowedExtensions, fileSize: 1024 * 1024 * 5 })))
    async uploadCompanyLogo(
        @UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: Express.Multer.File,
        @Param() param: MongoDBIdDto,
        @User() user: UserDocument
    ): Promise<IResponse<PathEntity>> {
        const path = await this.companyService.uploadCompanyLogo(file, param, user)
        return successResponse<PathEntity>({ data: { path } })
    }
    // -----------------------------------------upload company cover--------------------------------------------
    @Patch('/:id/cover')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @UseInterceptors(FileInterceptor('coverPic', cloudMulterOptions({ validation: ImageAllowedExtensions, fileSize: 1024 * 1024 * 5 })))
    async uploadCompanyCover(
        @UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: Express.Multer.File,
        @Param() param: MongoDBIdDto,
        @User() user: UserDocument
    ): Promise<IResponse<PathEntity>> {
        const path = await this.companyService.uploadCompanyCover(file, param, user)
        return successResponse<PathEntity>({ data: { path } })
    }
    // -----------------------------------------delete company logo--------------------------------------------
    @Delete('/:id/logo')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async deleteCompanyLogo(
        @Param() param: MongoDBIdDto,
        @User() user: UserDocument
    ): Promise<IResponse> {
        const message = await this.companyService.deleteCompanylogo(param, user)
        return successResponse({ message })
    }
    // -----------------------------------------delete company cover--------------------------------------------
    @Delete('/:id/cover')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async deleteCompanyCover(
        @Param() param: MongoDBIdDto,
        @User() user: UserDocument
    ): Promise<IResponse> {
        const message = await this.companyService.deleteCompanyCover(param, user)
        return successResponse({ message })
    }

}