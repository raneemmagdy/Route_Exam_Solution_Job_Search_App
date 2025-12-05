import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsEmail,

  IsMongoId,
  IsArray,
  IsEnum,

} from 'class-validator';
import { Types } from 'mongoose';
import { NumberOfEmployeeEnum } from 'src/Common';

export class AddCompanyDTO {
  // ---------------------- companyName ----------------------
  @IsString({ message: 'Company name must be a string' })
  @IsNotEmpty({ message: 'Company name is required' })
  companyName: string;

  // ---------------------- description ----------------------
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  // ---------------------- industry ----------------------
  @IsString({ message: 'Industry must be a string' })
  @IsNotEmpty({ message: 'Industry is required' })
  industry: string;

  // ---------------------- address ----------------------
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  // ---------------------- numberOfEmployees ----------------------
  @IsNotEmpty()
  @IsEnum(NumberOfEmployeeEnum, { message: `numberOfEmployees must be a valid range of ${Object.values(NumberOfEmployeeEnum).join(', ')}` })
  numberOfEmployees: NumberOfEmployeeEnum;

  // ---------------------- companyEmail ----------------------
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Company email is required' })
  companyEmail: string;


  // ---------------------- HRs ----------------------
  @IsOptional()
  @IsArray({ message: 'HRs must be an array' })
  @IsMongoId({ each: true, message: 'Each HR id must be a valid ObjectId' })
  HRs?: Types.ObjectId[];



}
