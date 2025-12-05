import { IsString, IsNotEmpty, IsEnum, IsArray, IsMongoId, IsBoolean, IsOptional } from 'class-validator';
import { JobLocationEnum, WorkingTimeEnum, SeniorityLevelEnum } from 'src/Common';

export class AddJobDTO {
  @IsString({ message: 'Job title must be a string' })
  @IsNotEmpty({ message: 'Job title is required' })
  jobTitle: string;

  @IsEnum(JobLocationEnum, { message: `Job location must be one of ${Object.values(JobLocationEnum).join(', ')}` })
  @IsNotEmpty({ message: 'Job location is required' })
  jobLocation: JobLocationEnum;

  @IsEnum(WorkingTimeEnum, { message: `Working time must be one of ${Object.values(WorkingTimeEnum).join(', ')}` })
  @IsNotEmpty({ message: 'Working time is required' })
  workingTime: WorkingTimeEnum;

  @IsEnum(SeniorityLevelEnum, { message: `Seniority level must be one of ${Object.values(SeniorityLevelEnum).join(', ')}` })
  @IsNotEmpty({ message: 'Seniority level is required' })
  seniorityLevel: SeniorityLevelEnum;

  @IsString({ message: 'Job description must be a string' })
  @IsNotEmpty({ message: 'Job description is required' })
  jobDescription: string;

  @IsArray({ message: 'Technical skills must be an array' })
  @IsString({ each: true , message: 'Each technical skill must be a string' })
  @IsNotEmpty({ message: 'Technical skills are required' })
  technicalSkills: string[];

  @IsArray({ message: 'Soft skills must be an array' })
  @IsString({ each: true , message: 'Each soft skill must be a string' })
  @IsNotEmpty({ message: 'Soft skills are required' })
  softSkills: string[];
}
