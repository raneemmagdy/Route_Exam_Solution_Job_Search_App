import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { MongoDBIdDto, RoleEnum } from "src/Common";
import { CompanyDocument, CompanyRepository, UserDocument, UserRepository } from "src/DB";

@Injectable()
export class AdminService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly companyRepository: CompanyRepository
    ) { }
    //================================================banORUnbanUser===============================================================
    // async banOrUnbanUser(params: MongoDBIdDto, user: UserDocument): Promise<string> {
    //     const { id } = params
    //     const userExists = await this.userRepository.findOne({ filter: { _id: id } });
    //     if (!userExists) {
    //         throw new NotFoundException('User not found');
    //     }
    //     // if (user.role !== RoleEnum.Admin) {
    //     //     throw new ForbiddenException('You are not authorized to ban or unban user (Admin Only)');
    //     // }

    //     if (userExists._id.toString() === user._id.toString()) {
    //         throw new BadRequestException('You can not ban or unban yourself');
    //     }
    //     console.log({ userExists: userExists.role });


    //     if (userExists.role === RoleEnum.Admin) {
    //         throw new ForbiddenException('You are not authorized to ban or unban admin');
    //     }

    //     let action: string;
    //     if (userExists.bannedAt) {
    //         await this.userRepository.updateOne({ filter: { _id: userExists._id }, update: { $unset: { bannedAt: 0 } } });
    //         action = "Unbanned";
    //     } else {
    //         await this.userRepository.updateOne({ filter: { _id: userExists._id }, update: { $set: { bannedAt: new Date() } } });
    //         action = "Banned";
    //     }

    //     return `User ${action} successfully`;
    // }
    //================================================banORUnbancompany===============================================================
    // async banOrUnbanCompany(params: MongoDBIdDto): Promise<string> {
    //     const { id } = params
    //     const company = await this.companyRepository.findOne({ filter: { _id: id } });
    //     if (!company) {
    //         throw new NotFoundException('Company not found');
    //     }
    //     // if (user.role !== RoleEnum.Admin) {
    //     //     throw new ForbiddenException('You are not authorized to ban or unban user (Admin Only)');
    //     // }

    //     let action: string;
    //     if (company.bannedAt) {
    //         await this.companyRepository.updateOne({ filter: { _id: company._id }, update: { $unset: { bannedAt: 0 } } });
    //         action = "Unbanned";
    //     } else {
    //         await this.companyRepository.updateOne({ filter: { _id: company._id }, update: { $set: { bannedAt: new Date() } } });
    //         action = "Banned";
    //     }

    //     return `company ${action} successfully`;
    // }


    //################################################################################Another Method
    //================================================banORUnbanGeneral===============================================================
    private async toggleBan(
        repository: UserRepository | CompanyRepository,
        id: Types.ObjectId,
        entityName: string,
        extraChecks?: (entity: UserDocument) => void
    ): Promise<string> {
        const entity = await repository.findOne({ filter: { _id: id } });
        if (!entity) {
            throw new NotFoundException(`${entityName} not found`);
        }

        if (extraChecks) extraChecks(entity as UserDocument);

        let action: string;

        if (entity.bannedAt) {
            await repository.updateOne({
                filter: { _id: entity._id },
                update: { $unset: { bannedAt: 0 } }
            });
            action = 'Unbanned';
        } else {
            await repository.updateOne({
                filter: { _id: entity._id },
                update: { $set: { bannedAt: new Date() } }
            });
            action = 'Banned';
        }

        return `${entityName} ${action} successfully`;
    }

   //================================================banORUnbanUser===============================================================
    async banOrUnbanUser(params: MongoDBIdDto, user: UserDocument): Promise<string> {
        const { id } = params;

        return this.toggleBan(
            this.userRepository,
            id,
            "User",
            (entity: UserDocument) => {
                if (entity._id.toString() === user._id.toString()) {
                    throw new BadRequestException('You can not ban or unban yourself');
                }

                if (entity.role === RoleEnum.Admin) {
                    throw new ForbiddenException('You are not authorized to ban or unban admin');
                }
            }
        );
    }

    //================================================banORUnbancompany===============================================================

    async banOrUnbanCompany(params: MongoDBIdDto): Promise<string> {
        const { id } = params;

        return this.toggleBan(
            this.companyRepository,
            id,
            "Company"
        );
    }











    //================================================approveCompany===============================================================
    async approveCompany(params: MongoDBIdDto, user: UserDocument): Promise<string> {
        const { id } = params
        const company = await this.companyRepository.findOne({ filter: { _id: id } });
        if (!company) {
            throw new NotFoundException('Company not found');
        }
        if (user.role !== RoleEnum.Admin) {
            throw new ForbiddenException('You are not authorized to ban or unban user (Admin Only)');
        }

        if (company.approvedByAdmin) {
            throw new BadRequestException('company already approved');
        }

        await this.companyRepository.updateOne({ filter: { _id: company._id }, update: { approvedByAdmin: true } });

        return `company approved successfully`;
    }


}