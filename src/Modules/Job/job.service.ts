import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CascadeService, IPagination } from 'src/Common';
import { CompanyDocument, CompanyRepository, JobDocument, JobRepository, UserDocument, UserRepository } from "src/DB";
import { AddJobDTO, GetJobsQueryDTO, GetJobsWithFilterQueryDTO, UpdateJobDTO } from "./DTO";
import { CompanyMongoDBIdDTO } from "../Company/DTO";
import { JobAndCompanyMongoDBIdDTO, JobAndCompanyMongoDBIdOptionalDTO, JobMongoDBIdDTO } from "./DTO/company-job-id.dto";
import { RootFilterQuery, Types } from "mongoose";


@Injectable()
export class JobService {
    constructor(
        private readonly jobRepository: JobRepository,
        private readonly companyRepository: CompanyRepository,
    ) { }

    //----------------------------------------------------------------------Check if job & company exist 
    async checkIfJobAndCompanyExist(
        param: JobAndCompanyMongoDBIdDTO | JobMongoDBIdDTO
    ): Promise<{ job: JobDocument, company: CompanyDocument }> {

        const job = await this.jobRepository.findOne({ filter: { _id: param.jobId } });
        if (!job) throw new NotFoundException('Job not found Or deleted');

        const companyId = 'companyId' in param ? param.companyId : job.companyId;
        console.log({ companyId });


        const company = await this.companyRepository.findOne({ filter: { _id: companyId } });
        if (!company) throw new NotFoundException('Company not found Or deleted');

        if (job.companyId.toString() !== company._id.toString()) {
            throw new BadRequestException("This job doesn't belong to this company");
        }

        return { job, company };
    }
    // ----------------------------------------------------------------------add job
    async addJob(body: AddJobDTO, param: CompanyMongoDBIdDTO, user: UserDocument): Promise<JobDocument> {
        let { companyId } = param
        let { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = body
        const company = await this.companyRepository.findOne({ filter: { _id: companyId } });
        if (!company) {
            throw new NotFoundException('Company not found Or deleted')
        }
        if (company.createdBy.toString() !== user._id.toString() && !company.HRs?.includes(user._id)) {
            throw new ForbiddenException('You are not authorized to add job to this company')
        }
        const [job] = await this.jobRepository.create({
            data: [
                { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills, companyId: company._id, addedBy: user._id }
            ]
        }) || []
        if (!job) throw new BadRequestException('Failed to add job')
        return job
    }

    // ----------------------------------------------------------------------Update job
    async updateJob(body: UpdateJobDTO, param: JobAndCompanyMongoDBIdDTO, user: UserDocument): Promise<JobDocument> {
        let { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = body

        const { job } = await this.checkIfJobAndCompanyExist(param)

        if (job.addedBy.toString() !== user._id.toString()) {
            throw new ForbiddenException('You are not authorized to update this job')
        }
        const jobData = await this.jobRepository.findOneAndUpdate({
            filter: { _id: job._id },
            update: { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills }
        })
        if (!jobData) throw new BadRequestException('Failed to update job')
        return jobData
    }
    // ----------------------------------------------------------------------delete job
    async deleteJob(param: JobAndCompanyMongoDBIdDTO, user: UserDocument): Promise<string> {
        const { job, company } = await this.checkIfJobAndCompanyExist(param)
        const isHR = company.HRs?.some(hrId => hrId.toString() === user._id.toString());
        if (!isHR) {
            throw new ForbiddenException('You are not authorized to delete this job (HR Only)');
        }

        const jobData = await this.jobRepository.updateOne({
            filter: { _id: job._id },
            update: { closed: true }
        })
        if (!jobData.modifiedCount) throw new BadRequestException('Failed to delete job');

        return "job deleted successfully"
    }

    //-----------------------------------------------------------------------getJobsOrSpecificJob
    async getJobsOrSpecificJob(query: GetJobsQueryDTO, param: JobAndCompanyMongoDBIdOptionalDTO): Promise<JobDocument | JobDocument[] | [] | IPagination<JobDocument>> {
        const { name, page, limit } = query;
        console.log('Done---------------------------------------------------');

        if (param.jobId) {
            const { job } = await this.checkIfJobAndCompanyExist(param as JobAndCompanyMongoDBIdDTO);
            await job.populate({ path: 'applications', populate: { path: 'userId', select: 'firstName lastName email' } })
            return job
        }
        let company: CompanyDocument | null = null;
        if (name) {
            company = await this.companyRepository.findOne({ filter: { companyName: name } });
        };
        console.log({ name });
        console.log({ company });

        if (!company && !param.companyId) {
            throw new NotFoundException('Company not found Or deleted')
        }
        console.log({ param: param.companyId });

        const result = await this.jobRepository.paginate({
            filter: { companyId: company ? company._id : new Types.ObjectId(param.companyId) },
            options: {
                sort: { createdAt: -1 },
                populate: [{ path: "applications", populate: { path: 'userId', select: 'firstName lastName email' } }]
            },
            page,
            limit
        });
        console.log({ result });

        return result;
    }
    //-----------------------------------------------------------------------get all jobs (filter)
    async getAllJobs(query: GetJobsWithFilterQueryDTO): Promise<JobDocument[] | [] | IPagination<JobDocument>> {
        console.log('filter==================================================');
        
        const { page, limit, jobTitle, jobLocation, workingTime, seniorityLevel, technicalSkills } = query;
        let filter: RootFilterQuery<JobDocument> = {};
        if (jobTitle) filter.jobTitle = jobTitle;
        if (jobLocation) filter.jobLocation = jobLocation;
        if (workingTime) filter.workingTime = workingTime;
        if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
        if (technicalSkills) filter.technicalSkills = { $in: technicalSkills };
        console.log({query});
        
        const result = await this.jobRepository.paginate({
            filter,
            options: {
                sort: { createdAt: -1 }
            },
            page,
            limit
        });
        return result;
    }



}