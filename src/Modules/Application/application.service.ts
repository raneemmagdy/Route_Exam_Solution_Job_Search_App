import { RealtimeGateway } from './../gateway/gateway';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ApplicationDocument, ApplicationRepository, CompanyRepository, connectedUsers, JobDocument, JobRepository, UserDocument, UserRepository } from "src/DB";
import { JobMongoDBIdDTO } from "../Job/DTO";
import { Types } from "mongoose";
import { emailEvent, FileUploadService, IPagination, MongoDBIdDto, PaginationDto } from "src/Common";
import { JobService } from "../Job/job.service";
import { ApplicationStatusDTO, DateDTO } from "./DTO";
import * as ExcelJS from 'exceljs';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class ApplicationService {
    constructor(
        private readonly applicationRepository: ApplicationRepository,
        private readonly jobRepository: JobRepository,
        private readonly companyRepository: CompanyRepository,
        private readonly userRepository: UserRepository,
        private readonly fileUploadService: FileUploadService,
        private readonly jobService: JobService,
        private readonly realtimeGateway: RealtimeGateway
    ) { }
    // ----------------------------------------------------------------------apply job
    async applyJob(param: JobMongoDBIdDTO, user: UserDocument, file: Express.Multer.File): Promise<ApplicationDocument> {
        let { jobId } = param;

        const { job } = await this.jobService.checkIfJobAndCompanyExist({ jobId });
        let userCV: { public_id: string, secure_url: string } | undefined = undefined;
        if (file) {
            const { public_id, secure_url } = await this.fileUploadService.uploadFile({
                file,
                options: { folder: `${process.env.APPLICATION_NAME}/Applications/${jobId}/CVs/${user._id}` }
            })
            userCV = { public_id, secure_url }
        }
        if (await this.applicationRepository.findOne({ filter: { jobId, userId: user._id } })) {
            throw new ConflictException('You have already applied for this job');
        }
        const [application] = await this.applicationRepository.create({
            data: [{ jobId: new Types.ObjectId(jobId), userId: user._id, userCV }]
        }) || [];
        if (!application) {
            await this.fileUploadService.destroyFolderAssets({ path: `${process.env.APPLICATION_NAME}/Applications/${jobId}/CVs/${user._id}` })
            await this.fileUploadService.destroyFolder({ folderPath: `${process.env.APPLICATION_NAME}/Applications/${jobId}/CVs/${user._id}` })
        }
        const connectedHR = connectedUsers.get(job.addedBy.toString())
        if (connectedHR) {
            console.log('connected', connectedUsers.get(job.addedBy.toString()));
            await application.populate([{ path: 'userId', select: 'firstName lastName email' }, { path: 'jobId', select: 'jobTitle' }]);
            console.log({ application });
            this.realtimeGateway.server.to(connectedHR).emit('newApplication', { message: 'New job application received!', application })
        }
        return application
    }
    // ----------------------------------------------------------------------Application status
    async applicationStatus(body: ApplicationStatusDTO, param: MongoDBIdDto, user: UserDocument): Promise<string> {
        let { id } = param;
        let { status } = body

        const application = await this.applicationRepository.findOne({ filter: { _id: id } });
        if (!application) {
            throw new NotFoundException('Application not found');
        }
        const { job, company } = await this.jobService.checkIfJobAndCompanyExist({ jobId: application.jobId });
        if (!company.HRs?.includes(user._id)) {
            throw new ForbiddenException('You are not authorized to update this application (HR Only)');
        }
        const applicant = await this.userRepository.findOne({ filter: { _id: application.userId, isConfirmed: { $exists: true } } });
        if (!applicant) throw new NotFoundException('Applicant not found');

        await this.applicationRepository.updateOne({ filter: { _id: id }, update: { status } })
        emailEvent.emit('statusEmail',
            {
                title: 'Job Application Update', subject: `Application status ${status}`,
                status, to: applicant.email, applicantName: applicant.firstName, jobTitle: job.jobTitle
            });
        return `Application status updated to ${status}`
    }
    // ----------------------------------------------------------------------get all applications for specific job
    async getAllApplications(query: PaginationDto, param: MongoDBIdDto, user: UserDocument):
        Promise<ApplicationDocument[] | [] | IPagination<ApplicationDocument>> {
        let { id: jobId } = param;
        let { page, limit } = query

        const { company } = await this.jobService.checkIfJobAndCompanyExist({ jobId });
        if (!company.HRs?.includes(user._id) && company.createdBy.toString() !== user._id.toString()) {
            throw new ForbiddenException('You are not authorized to view this applications (HR Or Owner Only)');
        }
        return await this.applicationRepository.paginate(
            {
                filter: { jobId: new Types.ObjectId(jobId) },
                options: { sort: { createdAt: -1 }, populate: { path: 'userId', select: 'firstName lastName email' } },
                page,
                limit
            });
    }

    //-----------------------------------------------------------------------Generate Excel Report
    async generateExcelReport(param: MongoDBIdDto, user: UserDocument, body: DateDTO): Promise<string> {
        const { id: companyId } = param;
        const { date } = body
        const company = await this.companyRepository.findOne({ filter: { _id: companyId } });
        if (!company) throw new NotFoundException('Company not found Or deleted');

        // Check if the user is authorized to access the report (company owner or HR)
        if (company.createdBy.toString() !== user._id.toString() && !company.HRs?.some((hr) => hr.toString() === user._id.toString())) {
            throw new ForbiddenException('Unauthorized: Only company owner or HRs can access this report');
        }


        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));


        const companyJobs = await this.jobRepository.find({ filter: { companyId: new Types.ObjectId(companyId) } });
        console.log({ companyJobs });

        const jobIds = companyJobs.map((job) => job._id);
        console.log({ jobIds });


        if (jobIds.length === 0) throw new NotFoundException('No jobs found for this company');

        const applications = await this.applicationRepository
            .find({
                filter: {
                    jobId: { $in: jobIds },
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                },
                options: {
                    populate: [{ path: 'userId', select: 'firstName lastName email' }, { path: 'jobId', select: 'jobTitle' }]
                }
            }) as (ApplicationDocument & {
                userId: Partial<UserDocument>,
                jobId: Partial<JobDocument>,
                createdAt: Date
            })[];

        if (applications.length === 0) {
            throw new NotFoundException('No applications found for this date');
        }

        // Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Applications');

        worksheet.columns = [
            { header: '#', key: 'index', width: 5 },
            { header: 'Applicant Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Job Title', key: 'jobTitle', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Applied On', key: 'appliedOn', width: 15 },
        ];

        applications.forEach((app, index) => {
            worksheet.addRow({
                index: index + 1,
                name: `${app.userId.fullName}`,
                email: app.userId.email,
                jobTitle: app.jobId.jobTitle,
                status: app.status,
                appliedOn: app.createdAt.toISOString().split('T')[0],
            });
        });

        const buffer = await workbook.xlsx.writeBuffer() as unknown as Buffer;

        // Upload to Cloudinary
        const reportUrl: UploadApiResponse = await this.fileUploadService.uploadBuffer({
            buffer,
            filename: `application-report-${Date.now()}.xlsx`,
            options: { folder: `${process.env.APPLICATION_NAME}/Applications/Reports`, resource_type: 'auto' },
        })

        return reportUrl.secure_url;
    }

}