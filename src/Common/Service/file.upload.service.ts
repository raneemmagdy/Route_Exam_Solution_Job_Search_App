import { Injectable } from "@nestjs/common"
import { Cloudinary } from "../Cloudinary"
import { UploadApiOptions, UploadApiResponse } from "cloudinary"
import * as streamifier from "streamifier"

@Injectable()
export class FileUploadService {
    constructor() { }
    private cloudinary = Cloudinary()

    //_______________________________________Upload Single File
    async uploadFile({ file, options }: { file: Express.Multer.File, options?: UploadApiOptions }): Promise<UploadApiResponse> {
        return await this.cloudinary.uploader.upload(file.path, options)
    }


    //_______________________________________Delete Single File
    async destroyFile({ public_id }: { public_id: string }) {
        return await this.cloudinary.uploader.destroy(public_id)
    }

    //_______________________________________Upload Multiple Files
    async uploadFiles({ files, options}:{files: Express.Multer.File[], options?: UploadApiOptions}) {
        let attachemnts: { secure_url: string, public_id: string }[] = []
        for (const file of files) {
            const { secure_url, public_id } = await this.uploadFile({file, options})
            attachemnts.push({ secure_url, public_id })

        }
        return attachemnts

    }

    //_______________________________________Delete Assets & Folder
    async destroyFolder({folderPath}:{folderPath: string}) {
        // await this.destroyFolderAssets({path: folderPath})
        await this.cloudinary.api.delete_folder(folderPath)
    }

    //_______________________________________Delete Assets
    async destroyFolderAssets({path}:{path: string}): Promise<void> {
        return await this.cloudinary.api.delete_resources_by_prefix(path)
    }
    //_______________________________________Upload Buffer (Excel, PDF, etc)
    async uploadBuffer({
        buffer,
        filename,
        options,
    }: {
        buffer: Buffer,
        filename?: string,
        options?: UploadApiOptions,
    }): Promise<UploadApiResponse> {

        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw",   
                    public_id: filename ,
                    ...options,
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result as UploadApiResponse)
                }
            )

            streamifier.createReadStream(buffer).pipe(uploadStream)
        })
    }
 
}