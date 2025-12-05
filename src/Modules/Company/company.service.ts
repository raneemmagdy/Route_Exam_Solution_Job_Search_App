import { CompanyRepository } from './../../DB/Repository/Company.repository';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CompanyDocument, User, UserDocument, UserRepository } from "src/DB";
import { AddCompanyDTO, SearchByNameDTO, UpdateCompanyDTO } from './DTO';
import { FileUploadService, IPagination, MongoDBIdDto, PaginationGraphDto, RoleEnum } from 'src/Common';
import { Types } from 'mongoose';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CompanyService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly companyRepository: CompanyRepository,
        private readonly fileUploadService: FileUploadService

    ) { }
    //----------------------------------------------------------------------ValidHR
    private async validHR(HRs: Types.ObjectId[] = [], userRepository: UserRepository): Promise<Types.ObjectId[]> {
        // Remove duplicates
        const uniqueHRs = [...new Set(HRs)];

        // Validate each HR exists in DB
        for (const hrId of uniqueHRs) {
            const hr = await userRepository.findOne({ filter: { _id: hrId,isConfirmed: { $exists: true } } });
            if (!hr) throw new NotFoundException(`HR with id ${hrId} not found Or deleted or not confirmed`);
        }

        return uniqueHRs;
    };
    //----------------------------------------------------------------------add company
    async addCompany(body: AddCompanyDTO, user: UserDocument, file: Express.Multer.File): Promise<CompanyDocument> {
        let { companyName, description, industry, address, numberOfEmployees, companyEmail, HRs } = body;
        console.log({ companyName, companyEmail });

        if (await this.companyRepository.findOne({ filter: { $or: [{ companyEmail }, { companyName }] } }) ) {
            throw new ConflictException('Company with this email  or name already exists');
        }

        let validHRs: Types.ObjectId[] = []
        if (HRs?.length) {
            validHRs = await this.validHR(HRs, this.userRepository);
        }
        console.log({ file });
        let legalAttachment: { secure_url: string, public_id: string } | undefined;

        if (file) {
            let { secure_url, public_id } = await this.fileUploadService.uploadFile({
                file, options: { folder: `${process.env.APPLICATION_NAME}/companies/${companyName}/legal` }
            })
            legalAttachment = { secure_url, public_id }
        }

        const [company] = await this.companyRepository.create({
            data: [{ companyName, description, industry, address, numberOfEmployees, companyEmail, createdBy: user._id, HRs: validHRs, legalAttachment }]
        }
        ) || []
        if (!company) {
            await this.fileUploadService.destroyFolderAssets({ path: `${process.env.APPLICATION_NAME}/companies/${companyName}/legal` })
            await this.fileUploadService.destroyFolder({ folderPath: `${process.env.APPLICATION_NAME}/companies/${companyName}/legal` })
            throw new BadRequestException('Failed to create company')
        }
        return company
    }
    //----------------------------------------------------------------------Update company
    async updateCompany(body: UpdateCompanyDTO, params: MongoDBIdDto, user: UserDocument): Promise<CompanyDocument> {
        const { id } = params
        const { companyName, description, industry, address, numberOfEmployees, companyEmail, HRs } = body;
        const company = await this.companyRepository.findOne({ filter: { _id: id } });
        if (!company) {
            throw new NotFoundException('Company not found')
        }
        if (await this.companyRepository.findOne({ filter: { $or: [{ companyEmail }, { companyName }], _id: { $ne: id } } })) {
            throw new ConflictException('Company with this email  or name already exists');
        }
        if (company.createdBy.toString() !== user._id.toString()) {
            throw new ForbiddenException('You are not authorized to update this company (Owner Only)');
        }
        let validHRs: Types.ObjectId[] = []
        if (HRs?.length) {
            validHRs = await this.validHR(HRs, this.userRepository);
        }
        const oldAndNewHRs = [...company.HRs || [], ...validHRs]
        const companyData = await this.companyRepository.findByIdAndUpdate({
            id,
            update: { companyName, description, industry, address, numberOfEmployees, companyEmail, HRs: oldAndNewHRs }
        })
        if (!companyData) throw new BadRequestException('Failed to update company');

        return companyData
    }
    //----------------------------------------------------------------------(Owner & admin Only)delete company(soft delete)
    async deleteCompany(params: MongoDBIdDto, user: UserDocument): Promise<string> {
        const { id } = params
        const company = await this.companyRepository.findOne({ filter: { _id: id } });
        if (!company) {
            throw new NotFoundException('Company not found')
        }
        if (company.createdBy.toString() !== user._id.toString() && user.role !== RoleEnum.Admin) {
            throw new ForbiddenException('You are not authorized to update this company (Owner Or Admin Only)');
        }
        const companyData = await this.companyRepository.updateOne({ filter: { _id: id }, update: { deletedAt: new Date() } })
        if (!companyData.modifiedCount) throw new BadRequestException('Failed to delete company');

        return 'company deleted successfully'
    }
    //----------------------------------------------------------------------Search By Company Name
    async searchByCompanyName(query: SearchByNameDTO): Promise<CompanyDocument> {
        let { companyName } = query;
        const company = await this.companyRepository.findOne({ filter: { companyName } });
        if (!company) {
            throw new NotFoundException('no company found with this name');
        }
        return company
    }
    //----------------------------------------------------------------------Upload logo of company
    async uploadCompanyLogo(file: Express.Multer.File, param: MongoDBIdDto, user: UserDocument): Promise<string | undefined> {
        const { id } = param
        console.log({ id });
        const company = await this.companyRepository.findOne({ filter: { _id: id } })
        if (!company) {
            throw new NotFoundException('Company not found')
        }
        if (company.createdBy.toString() !== user._id.toString()) {
            throw new ForbiddenException('You are not authorized to update this company (Owner Only)')

        }
        if (company.logo?.public_id) {
            await this.fileUploadService.destroyFile({ public_id: company.logo.public_id })
        }
        const { secure_url, public_id } = await this.fileUploadService.uploadFile({
            file,
            options: { folder: `${process.env.APPLICATION_NAME}/companies/${company.companyName}/logo` }
        })
        const result = await this.companyRepository.findOneAndUpdate({ filter: { _id: company._id }, update: { logo: { secure_url, public_id } } })
        if (!result) {
            throw new NotFoundException('Failed to update logo ');
        }
        return result.logo?.secure_url
    }
    //----------------------------------------------------------------------Upload cover of company
    async uploadCompanyCover(file: Express.Multer.File, param: MongoDBIdDto, user: UserDocument): Promise<string | undefined> {
        const { id } = param
        const company = await this.companyRepository.findOne({ filter: { _id: id } })
        if (!company) {
            throw new NotFoundException('Company not found')
        }
        if (company.createdBy.toString() !== user._id.toString()) {
            throw new ForbiddenException('You are not authorized to update this company (Owner Only)')

        }
        if (company.coverPic?.public_id) {
            await this.fileUploadService.destroyFile({ public_id: company.coverPic.public_id })
        }
        const { secure_url, public_id } = await this.fileUploadService.uploadFile({
            file,
            options: { folder: `${process.env.APPLICATION_NAME}/companies/${company.companyName}/cover` }
        })
        const result = await this.companyRepository.findOneAndUpdate({ filter: { _id: company._id }, update: { coverPic: { secure_url, public_id } } })
        if (!result) {
            throw new NotFoundException('Failed to update Cover pic');
        }
        return result.coverPic?.secure_url
    }

    //-----------------------------------------delete Company logo--------------------------------------------
    async deleteCompanylogo(param: MongoDBIdDto, user: UserDocument): Promise<string> {
        let { id } = param
        const company = await this.companyRepository.findOne({ filter: { _id: id } })
        if (!company) {
            throw new NotFoundException('Company not found')
        }
        if (company.createdBy.toString() !== user._id.toString()) {
            throw new ForbiddenException('You are not authorized to update this company (Owner Only)')
        }

        if (!company.logo?.public_id) {
            throw new NotFoundException('no profile pic found to delete');
        }
        await this.fileUploadService.destroyFile({ public_id: company.logo.public_id })
        await this.fileUploadService.destroyFolder({ folderPath: `${process.env.APPLICATION_NAME}/companies/${company.companyName}/logo` })
        const result = await this.companyRepository.findOneAndUpdate({ filter: { _id: company._id }, update: { $unset: { logo: 0 } } })
        console.log({ result });

        if (!result) {
            throw new NotFoundException('Failed to make this process');
        }
        return "Done"
    }
    //-----------------------------------------delete Company Cover--------------------------------------------
    async deleteCompanyCover(param: MongoDBIdDto, user: UserDocument): Promise<string> {
        let { id } = param
        const company = await this.companyRepository.findOne({ filter: { _id: id } })
        if (!company) {
            throw new NotFoundException('Company not found')
        }
        if (company.createdBy.toString() !== user._id.toString()) {
            throw new ForbiddenException('You are not authorized to update this company (Owner Only)')
        }

        if (!company.coverPic?.public_id) {
            throw new NotFoundException('no profile pic found to delete');
        }
        await this.fileUploadService.destroyFile({ public_id: company.coverPic.public_id })
        await this.fileUploadService.destroyFolder({ folderPath: `${process.env.APPLICATION_NAME}/companies/${company.companyName}/cover` })
        const result = await this.companyRepository.findOneAndUpdate({ filter: { _id: company._id }, update: { $unset: { coverPic: 0 } } })
        console.log({ result });

        if (!result) {
            throw new NotFoundException('Failed to make this process');
        }
        return "Done"
    }
    //-----------------------------------------Get Specific Company With Jobs--------------------------------------------
    async getSpecificCompany(param: MongoDBIdDto): Promise<CompanyDocument> {
        let { id } = param
        const company = await this.companyRepository.findOne({
            filter: { _id: id }, options: {
                populate: {
                    path: 'jobs'
                }
            }
        })
        if (!company) {
            throw new NotFoundException('Company not found')
        }
        return company
    }
    //-----------------------------------------find All Companies--------------------------------------------
    async findAll(query: PaginationGraphDto = {}): Promise<CompanyDocument[] | [] | IPagination<CompanyDocument>> {
        let { limit, page } = query
        const result = this.companyRepository.paginate({ limit, page })
        return result
    }



}