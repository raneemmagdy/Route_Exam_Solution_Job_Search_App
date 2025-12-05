import { Type } from "class-transformer";
import { IsDate, IsNotEmpty } from "class-validator";
import { IsDateInPast } from "src/Common/Decorators/date.custom.decorator";

export class DateDTO{
    @IsDateInPast({ message: 'Date must be in the past' })
    @IsNotEmpty({ message: 'Date is required' })
    @IsDate({ message: 'Date must be a valid date' })
    @Type(() => Date)
    date: Date
}