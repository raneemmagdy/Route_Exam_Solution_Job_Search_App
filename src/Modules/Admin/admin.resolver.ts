import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserService } from '../User/user.service';
import { CompanyService } from '../Company/company.service';
import { GetAllUserResponse } from '../User/Entity/user.entity';
import { GetAllCompanyResponse } from '../Company/Entity/company.entity';
import { Auth, PaginationGraphDto, RoleEnum, TokenEnum } from 'src/Common';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { AllDataUnion } from './Entity/user-company.entity';

@Resolver()
export class AdminResolver {
    constructor(
        private readonly userService: UserService,
        private readonly companyService: CompanyService,
    ) { }


    @Auth([RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @Query(() => GetAllUserResponse)
    async getAllUsers(@Args("query", { nullable: true }) query: PaginationGraphDto) {
        const result = await this.userService.findAll({ ...query, page: 'all' })
        return result
    }

    @Auth([RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @Query(() => GetAllCompanyResponse)
    async getAllCompanies(@Args("query", { nullable: true }) query: PaginationGraphDto) {
        const result = await this.companyService.findAll(query)
        return result
    }


    //=================================================================================================
    @Auth([RoleEnum.Admin], TokenEnum.access)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @Query(() => [AllDataUnion], { name: 'getAllData' })
    async getAllData(@Args("query", { nullable: true }) query: PaginationGraphDto) {
        const users = await this.userService.findAll(query);
        const companies = await this.companyService.findAll(query);
        return [
            users,
            companies
        ];
    }


}