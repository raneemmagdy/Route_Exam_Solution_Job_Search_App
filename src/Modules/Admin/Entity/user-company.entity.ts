import { createUnionType } from '@nestjs/graphql';
import { GetAllCompanyResponse } from 'src/Modules/Company/Entity/company.entity';
import { GetAllUserResponse } from 'src/Modules/User/Entity/user.entity';

export const AllDataUnion = createUnionType({
    name: 'AllDataUnion',
    types: () => [GetAllUserResponse, GetAllCompanyResponse] as const,
    resolveType(value) {
        if (value.result?.[0]?.firstName) return GetAllUserResponse;
        if (value.result?.[0]?.companyName) return GetAllCompanyResponse;
        return null;
    },
});
