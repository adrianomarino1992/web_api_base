import ControllersDecorators from "../decorators/controllers/ControllerDecorators";
import ValidationDecorators from "../decorators/validations/ValidationDecorators";

export function Validate()
{
    return ControllersDecorators.Validate();
}

export function ValidateObject<T extends Object>(obj : T)
{
    return ValidationDecorators.Validate(obj);
}

export function Required(message?: string)
{
    return ValidationDecorators.Required(message);
}

export function MaxLenght(max : number, message?: string)
{
    return ValidationDecorators.MaxLenght(max, message);
}

export function MinLenght(min : number, message?: string)
{
    return ValidationDecorators.MinLenght(min, message);
}

export function Max(max : number, message?: string)
{
    return ValidationDecorators.MaxValue(max, message);
}

export function Min(min : number, message?: string)
{
    return ValidationDecorators.MinValue(min, message);
}

export function Regex(regex: RegExp, message?: string)
{
    return ValidationDecorators.Regex(regex, message);
}

export function Rule<T extends Object, U extends keyof T>(action: (a : T[U]) => boolean, message?: string)
{
    return ValidationDecorators.Rule<T, U>(action, message);
}
