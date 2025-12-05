import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/Common";
import { AddJobDTO } from "./add-job.dto";
import { IntersectionType, PartialType, PickType } from "@nestjs/mapped-types";

export class GetJobsQueryDTO extends PaginationDto {
    @IsString({ message: 'company name must be a string' })
    @IsOptional()
    name?: string
}

export class FilterQueryDTO extends PartialType(
    PickType(AddJobDTO, ['jobTitle', 'jobLocation', 'workingTime', 'seniorityLevel']),
) {
    @IsOptional()
    @IsString({ each: true, message: 'Technical skills must be an array of strings' })
    technicalSkills?: string[] | string;
}


export class GetJobsWithFilterQueryDTO extends IntersectionType(
    FilterQueryDTO,
    PaginationDto,
) { }