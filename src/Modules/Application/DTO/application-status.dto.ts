import { IsEnum, IsNotEmpty } from "class-validator";
import { ApplicationStatusEnum } from "src/Common";

export class ApplicationStatusDTO {
    @IsEnum(ApplicationStatusEnum, { message: `Application status must be one of ${Object.values(ApplicationStatusEnum).join(', ')}` })
    @IsNotEmpty({ message: 'Application status is required' })
    status: ApplicationStatusEnum;
}
