import { IsNotEmpty, IsMongoId, IsString, MaxLength } from 'class-validator';

export class SendMessageDTO {
  @IsMongoId({ message: 'receiverId must be a valid MongoId' })
  @IsNotEmpty({ message: 'receiverId cannot be empty' })
  receiverId: string;

  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message cannot be empty' })
  message: string;
}
