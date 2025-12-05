import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const User = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        let user: any;

        switch (context.getType<string>()) {
            case 'http':
                user = context.switchToHttp().getRequest().credentials.user;
                break;

            case 'graphql':
                user = GqlExecutionContext.create(context).getContext().req.credentials.user;
                break;

            case 'ws':
                user = context.switchToWs().getClient().credentials.user;
                break;

            default:
                break;
        }
        return user;
    },
);
export const Decoded = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        let decoded: any;

        switch (context.getType<string>()) {
            case 'http':
                decoded = context.switchToHttp().getRequest().credentials.decoded;
                break;

            case 'graphql':
                decoded = GqlExecutionContext.create(context).getContext().req.credentials.decoded;
                break;

            case 'ws':
                decoded = context.switchToWs().getClient().credentials.decoded;
                break;

            default:
                break;
        }
        return decoded;
    },
);