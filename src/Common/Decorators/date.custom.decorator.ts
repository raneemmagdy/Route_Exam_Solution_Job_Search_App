import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsDateInPast(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsDateInPast',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          const now = new Date();
          return value.getTime() < now.getTime();
        },
        defaultMessage() {
          return 'Date of birth must be in the past';
        },
      },
    });
  };
}
