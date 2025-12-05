import { ApplicationRepository,CompanyRepository,JobRepository,ChatRepository } from 'src/DB';
import { Injectable } from "@nestjs/common";
import { Types } from 'mongoose';

@Injectable()
export class CascadeService {
    constructor(
        private readonly jobRepository: JobRepository,
        private readonly applicationRepository: ApplicationRepository,
        private readonly chatRepository: ChatRepository,
        private readonly companyRepository: CompanyRepository
    ) { }

    async deleteCompany(companyId: Types.ObjectId) {
        //delete applications
        const jobIds = (await this.jobRepository.find({ filter: { companyId } })).map(j => j._id);
        await this.applicationRepository.updateMany({ filter: { jobId: { $in: jobIds } }, update: { deletedAt: new Date() } });

        //delete jobs
        await this.jobRepository.updateMany({ filter: { companyId }, update: { deletedAt: new Date() } });

        //delete chats
        const company = await this.companyRepository.findOne({ filter: { _id: companyId } });
        if (company) {
            await this.chatRepository.updateMany({
                filter: { senderId: { $in: [...company.HRs || [], company.createdBy] } },
                update: { deletedAt: new Date() }
            });
        }
    }

    async deleteUser(userId: Types.ObjectId) {
        //delete applications
        await this.applicationRepository.updateMany({ filter: { userId }, update: { deletedAt: new Date() } });

        //delete chats
        await this.chatRepository.updateMany({
            filter: { $or: [{ senderId: userId }, { receiverId: userId }] },
            update: { deletedAt: new Date() }
        });

        //delete jobs
        await this.jobRepository.updateMany({ filter: { addedBy: userId }, update: { closed: true } });

        //delete companies
        await this.companyRepository.updateMany({ filter: { createdBy: userId }, update: { deletedAt: new Date() } });
    }

    async deleteApplication(jobId: Types.ObjectId) {
        //delete applications
        await this.applicationRepository.updateMany({
            filter: { jobId },
            update: { deletedAt: new Date() }
        });
    }
}
