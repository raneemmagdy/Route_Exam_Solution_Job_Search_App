import { PartialType, PickType } from "@nestjs/mapped-types";
import { AddJobDTO } from "./add-job.dto";

export class UpdateJobDTO extends PartialType(
  PickType(AddJobDTO, ['jobTitle', 'jobLocation', 'workingTime', 'seniorityLevel', 'jobDescription', 'technicalSkills', 'softSkills'])
) {}