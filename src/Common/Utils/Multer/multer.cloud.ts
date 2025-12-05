import { BadRequestException } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import type { Request } from "express";
import { diskStorage } from "multer";


export const cloudMulterOptions = ({ validation = [], fileSize = 1024 * 1024 }: {validation?: string[], fileSize?: number }): MulterOptions => {
   
    const storage = diskStorage({})
    const limits = {fileSize}
    const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
        if (!validation.includes(file.mimetype)) {
            return cb(new BadRequestException("Invalid file format"), false);
        }
        return cb(null, true);

    }
    return { storage, limits, fileFilter }
}
