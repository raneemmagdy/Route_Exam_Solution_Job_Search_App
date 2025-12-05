import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @IsInt({ message: 'Page must be an integer' })
    @IsPositive({ message: 'Page must be positive' })
    @IsOptional()
    @Min(1, { message: 'Page must be at least 1' })
    @Type(() => Number)
    page: number;
    @IsInt({ message: 'Page must be an integer' })
    @IsPositive({ message: 'Page must be positive' })
    @IsOptional()
    @Min(1, { message: 'Page must be at least 1' })
    @Type(() => Number)
    limit: number;
}

//===================================================GraphQL===================================================
@InputType({description: 'Pagination input type'})
export class PaginationGraphDto {
    @IsInt({ message: 'Page must be an integer' })
    @IsPositive({ message: 'Page must be positive' })
    @IsOptional()
    @Min(1, { message: 'Page must be at least 1' })
    @Field(() => Number, { nullable: true })
    page?: number | "all";
    @IsInt({ message: 'Page must be an integer' })
    @IsPositive({ message: 'Page must be positive' })
    @IsOptional()
    @Min(1, { message: 'Page must be at least 1' })
    @Field(() => Number, { nullable: true })
    limit?: number;
}