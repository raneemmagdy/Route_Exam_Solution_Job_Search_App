import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from "class-validator";

@ValidatorConstraint({ name: 'match_between_fields', async: false })
export class MatchBetweenFields<T = any> implements ValidatorConstraintInterface {
    validate(value: T, args: ValidationArguments) {
        console.log(({
            value,//confirm password value 
            args,
            matchWith: args.constraints[0],//password
            matchWithValue: args.object[args.constraints[0]] //password value
        }));

        return value === args.object[args.constraints[0]]
    }
    defaultMessage(validationArguments?: ValidationArguments): string {
        return `failed to match the field :: ${validationArguments?.property} with target ${validationArguments?.constraints[0]}`
    } 
}

export function IsMatch<T = any>(constraints: string[], validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints,
            validator: MatchBetweenFields<T>,
        });
    };
}