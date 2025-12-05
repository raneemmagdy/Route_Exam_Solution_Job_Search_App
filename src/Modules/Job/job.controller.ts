import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { JobService } from "./job.service";
import { AddJobDTO, GetJobsQueryDTO, GetJobsWithFilterQueryDTO, UpdateJobDTO } from "./DTO";
import { Auth, IResponse, RoleEnum, successResponse, TokenEnum, User } from "src/Common";
import { JobDocument, UserDocument } from "src/DB";
import { JobResponse } from "./Entity/job.entity";
import { CompanyMongoDBIdDTO } from "../Company/DTO";
import { JobAndCompanyMongoDBIdDTO, JobAndCompanyMongoDBIdOptionalDTO } from "./DTO/company-job-id.dto";
import { GetAllResponse } from "src/Common/Entity/pagination.entity";

@Controller([
    'company/:companyId/job',
    'job'

])
export class JobController {
    constructor(
        private readonly jobService: JobService
    ) { }
    // ----------------------------------------------------------------------add job
    @Post()
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async addJob(@Body() body: AddJobDTO, @Param() param: CompanyMongoDBIdDTO, @User() user: UserDocument): Promise<IResponse<JobResponse>> {
        const job = await this.jobService.addJob(body, param, user)
        return successResponse<JobResponse>({ data: { job }, statusCode: HttpStatus.CREATED })
    }

    // ----------------------------------------------------------------------Update job
    @Patch(':jobId')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async updateJob(@Body() body: UpdateJobDTO, @Param() param: JobAndCompanyMongoDBIdDTO, @User() user: UserDocument): Promise<IResponse<JobResponse>> {
        const job = await this.jobService.updateJob(body, param, user)
        return successResponse<JobResponse>({ data: { job } })
    }
    // ----------------------------------------------------------------------Delete job
    @Delete(':jobId')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async deleteJob(@Param() param: JobAndCompanyMongoDBIdDTO, @User() user: UserDocument): Promise<IResponse> {
        const message = await this.jobService.deleteJob(param, user)
        return successResponse({ message })
    }

    // ----------------------------------------------------------------------Get All jobs
    @Get('filter')
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async getAllJobs(@Query() query: GetJobsWithFilterQueryDTO): Promise<IResponse<JobResponse | GetAllResponse<JobDocument>>> {
        const result = await this.jobService.getAllJobs(query)
        return successResponse<JobResponse | GetAllResponse<JobDocument>>({ data: { result } })
    }

    // ----------------------------------------------------------------------Get specific job Or all jobs
    @Get([
        '{/:jobId}',
        ''
    ])
    @Auth([RoleEnum.User, RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async getSpecificJob(@Query() query: GetJobsQueryDTO, @Param() param: JobAndCompanyMongoDBIdOptionalDTO): Promise<IResponse<JobResponse | GetAllResponse<JobDocument>>> {
        const result = await this.jobService.getJobsOrSpecificJob(query, param)
        return successResponse<JobResponse | GetAllResponse<JobDocument>>({ data: { result } })
    }


}