import { IsMongoId, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class MongoDBIdDto {
    @IsMongoId({ message: 'Invalid id format' })
    @IsNotEmpty({ message: 'Id is required' })
    id: Types.ObjectId;
}





