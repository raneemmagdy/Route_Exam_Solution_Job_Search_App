import { BadRequestException, Get, Injectable, NotFoundException, Type } from "@nestjs/common";
import { UserDocument, UserRepository } from "src/DB";
import { UpdateAccountDTO, UpdatePasswordDTO } from "./DTO";
import { compareHash, decrypt, encrypt, generateHash, MongoDBIdDto, FileUploadService, IPagination } from "src/Common";
import { GetAccountDataEntity } from "./Entity/user.entity";
import { Types } from "mongoose";
import { PaginationDto, PaginationGraphDto } from "src/Common/DTO/pagination.dto";

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly fileUploadService: FileUploadService
    ) { }

    //-----------------------------------------Update User Account--------------------------------------------
    async updateAccount(body: UpdateAccountDTO, user: UserDocument): Promise<Partial<UserDocument> | null> {
        console.log({ user });
        let encryptedMobileNumber: string | undefined = body.mobileNumber;
        if (body.mobileNumber) {
            encryptedMobileNumber = await encrypt({ plainText: body.mobileNumber });
        }
        return await this.userRepository.findOneAndUpdate({
            filter: { _id: user._id },
            update: { ...body, mobileNumber: encryptedMobileNumber },
            options: { projection: { password: 0, role: 0, isConfirmed: 0 } }
        })
    }
    //-----------------------------------------Get Account (logged in user)--------------------------------------------
    async getAccount(user: UserDocument): Promise<GetAccountDataEntity> {
        user.mobileNumber = await decrypt({ ciphertext: user.mobileNumber });
        const plainUser = user.toObject();
        return new GetAccountDataEntity(plainUser);
    }
    //-----------------------------------------share account--------------------------------------------
    async shareAccount(param: MongoDBIdDto): Promise<Partial<UserDocument>> {
        const { id } = param
        console.log({ id });

        const user = await this.userRepository.findById({
            id,
            projection: { mobileNumber: 1, profilePic: 1, coverPic: 1, fullName: 1, _id: 0 }
        });

        if (!user) {
            throw new NotFoundException('user not found');
        }
        user.mobileNumber = await decrypt({ ciphertext: user.mobileNumber });
        const plainUser = user.toObject();
        return plainUser
    }

    //-----------------------------------------Update Password--------------------------------------------
    async updatePassword(body: UpdatePasswordDTO, user: UserDocument): Promise<string> {

        const { oldPassword, password } = body
        if (!await compareHash(oldPassword, user.password)) {
            throw new BadRequestException('invalid credentials');
        }
        if (password === oldPassword) {
            throw new NotFoundException('new password can not be same as old password');
        }

        const result = await this.userRepository.updateOne({
            filter: { _id: user._id },
            update: { password: await generateHash(password), changeCredentialTime: new Date() }
        })
        if (!result.matchedCount) {
            throw new NotFoundException('Failed to update password');
        }
        return 'password updated successfully'
    }
    //-----------------------------------------Soft Delete Account--------------------------------------------
    async deleteAccount(user: UserDocument): Promise<string> {
        const result = await this.userRepository.updateOne({
            filter: { _id: user._id },
            update: { deletedAt: new Date() }
        })
        if (!result.matchedCount) {
            throw new NotFoundException('Failed to update password');
        }
        return 'account deleted successfully'
    }

    //-----------------------------------------Upload Profile Pic--------------------------------------------
    async uploadProfilePic(file: Express.Multer.File, user: UserDocument): Promise<string | undefined> {
        if (user.profilePic?.public_id) {
            await this.fileUploadService.destroyFile({ public_id: user.profilePic.public_id })
        }
        const { secure_url, public_id } = await this.fileUploadService.uploadFile({
            file,
            options: { folder: `${process.env.APPLICATION_NAME}/users/${user._id}/profile` }
        })
        const result = await this.userRepository.findOneAndUpdate({ filter: { _id: user._id }, update: { profilePic: { secure_url, public_id } } })
        if (!result) {
            throw new NotFoundException('Failed to update profile pic');
        }
        return result.profilePic?.secure_url
    }
    //-----------------------------------------Upload Cover Pic--------------------------------------------
    async uploadCoverPic(file: Express.Multer.File, user: UserDocument): Promise<string | undefined> {
        if (user.coverPic?.public_id) {
            await this.fileUploadService.destroyFile({ public_id: user.coverPic.public_id })
        }
        const { secure_url, public_id } = await this.fileUploadService.uploadFile({
            file,
            options: { folder: `${process.env.APPLICATION_NAME}/users/${user._id}/Cover` }
        })
        const result = await this.userRepository.findOneAndUpdate({ filter: { _id: user._id }, update: { coverPic: { secure_url, public_id } } })
        if (!result) {
            throw new NotFoundException('Failed to update profile pic');
        }
        return result.coverPic?.secure_url
    }

    //-----------------------------------------delete Profile Pic--------------------------------------------
    async deleteProfilePic(user: UserDocument): Promise<string> {
        if (!user.profilePic?.public_id) {
            throw new NotFoundException('no profile pic found to delete');
        }
        await this.fileUploadService.destroyFile({ public_id: user.profilePic.public_id })
        await this.fileUploadService.destroyFolder({ folderPath: `${process.env.APPLICATION_NAME}/users/${user._id}/profile` })
        const result = await this.userRepository.findOneAndUpdate({ filter: { _id: user._id }, update: { $unset: { profilePic: 0 } } })
        console.log({ result });

        if (!result) {
            throw new NotFoundException('Failed to make this process');
        }
        return "Done"
    }
    //-----------------------------------------Delete Cover Pic--------------------------------------------
    async deleteCoverPic(user: UserDocument): Promise<string> {
        if (!user.coverPic?.public_id) {
            throw new NotFoundException('no Cover pic found to delete');
        }
        await this.fileUploadService.destroyFile({ public_id: user.coverPic.public_id })
        await this.fileUploadService.destroyFolder({ folderPath: `${process.env.APPLICATION_NAME}/users/${user._id}/Cover` })
        const result = await this.userRepository.findOneAndUpdate({ filter: { _id: user._id }, update: { $unset: { coverPic: 0 } } })
        if (!result) {
            throw new NotFoundException('Failed to make this process');
        }
        return "Done"
    }
    //-----------------------------------------find All Users--------------------------------------------
    async findAll(query: PaginationGraphDto = {}): Promise<UserDocument[] | [] | IPagination<UserDocument>> {
        let { limit, page } = query
        const result = this.userRepository.paginate({limit, page })
        return result
    }
    //-----------------------------------------find All Users Chat--------------------------------------------
    async findAllChat(query: PaginationGraphDto = {}): Promise<UserDocument[] | [] | IPagination<UserDocument>> {
        let { limit, page } = query
        const result = this.userRepository.paginate({limit, page })
        return result
    }





}