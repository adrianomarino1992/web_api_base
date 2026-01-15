import OwnMetadaContainer from '../../metadata/OwnMetaDataContainer';


export default class ValidationDecorators
{
    
    private static _requiredKeyMetadata = "meta:validation-required";
    private static _maxlenghtKeyMetadata = "meta:validation-maxLenght";
    private static _minlenghtKeyMetadata = "meta:validation-minLenght";
    private static _regexKeyMetadata = "meta:validation-regex";
    private static _ruleKeyMetadata = "meta:validation-rule";
    private static _maxValueKeyMetadata = "meta:validation-maxValue";
    private static _minValueKeyMetadata = "meta:validation-minValue";
    private static _keysToValidateKeyMetada = "meta:mustValidate";


    public static AddField(ctor : Function, property : string)
    {
        let meta = this.GetFields(ctor);        
        meta.push(property);
        Reflect.defineMetadata(ValidationDecorators._keysToValidateKeyMetada, meta, ctor.prototype);
        OwnMetadaContainer.Set(ctor, ValidationDecorators._keysToValidateKeyMetada, undefined, meta);
    }

    public static GetFields(ctor : Function) : string[]
    {      

        let meta = Reflect.getMetadata(ValidationDecorators._keysToValidateKeyMetada, ctor.prototype);

        if(!meta)
        {
            let ownMeta = OwnMetadaContainer.Get(ctor, ValidationDecorators._keysToValidateKeyMetada);

            if(ownMeta)
                meta = ownMeta.Value;  
            else 
                meta = [];          
        }

        return meta;
    }

    public static Required(message? : string)  
    {
        return function( target : Object, property : string)
        {            
            const constructor = typeof target == 'function' ? target : target.constructor;

            const prototype = typeof target == 'function' ? target.prototype : target;

            ValidationDecorators.AddField(constructor, property);
            let msg = message ?? `The field ${constructor.name}.${property} is required`;
            
            let requiredValidation : IValidationWithMessage = {Message : msg};

            OwnMetadaContainer.Set(constructor, ValidationDecorators._requiredKeyMetadata, property, requiredValidation);
            Reflect.defineMetadata(ValidationDecorators._requiredKeyMetadata, requiredValidation, prototype, property);            
        }
    }

    public static IsRequired(ctor : Function, property : string) : {Message : string} | undefined
    {
        return ValidationDecorators.TryGetValue<IValidationWithMessage>(ctor, property, ValidationDecorators._requiredKeyMetadata);
    }

    public static MaxLenght(max : number, message? : string)  
    {        
        return function( target : Object, property : string)
        {            
            const constructor = typeof target == 'function' ? target : target.constructor;

        const prototype = typeof target == 'function' ? target.prototype : target;

            ValidationDecorators.AddField(constructor, property);
            let msg = message ?? `The field ${constructor.name}.${property} must be a maximum of ${max} caracteres`;
            let maxLenghtValidation : IMaxLengthValidation = {Message : msg, Max : max};

            OwnMetadaContainer.Set(constructor, ValidationDecorators._maxlenghtKeyMetadata, property, maxLenghtValidation);
            Reflect.defineMetadata(ValidationDecorators._maxlenghtKeyMetadata, maxLenghtValidation , prototype, property);            
        }
    }

    public static GetMaxlenght(target : Function, property : string) : {Message : string, Max : number}  | undefined
    {
        return ValidationDecorators.TryGetValue<IMaxLengthValidation>(target, property, ValidationDecorators._maxlenghtKeyMetadata);        
    }

    public static MinLenght(min : number, message? : string)  
    {
        return function( target : Object, property : string)
        {            
            const constructor = typeof target == 'function' ? target : target.constructor;

            const prototype = typeof target == 'function' ? target.prototype : target;

            ValidationDecorators.AddField(constructor, property);

            let msg = message ?? `The field ${constructor.name}.${property} must be a minimum of ${min} caracteres`;

            let minLenghtValidation : IMinLengthValidation = {Message : msg, Min : min};

            OwnMetadaContainer.Set(constructor, ValidationDecorators._minlenghtKeyMetadata, property,minLenghtValidation );

            Reflect.defineMetadata(ValidationDecorators._minlenghtKeyMetadata, minLenghtValidation , prototype, property);           
        }
    }

    public static GetMinlenght(target : Function, property : string) : {Message : string, Min : number} | undefined
    {
        return ValidationDecorators.TryGetValue<IMinLengthValidation>(target, property, ValidationDecorators._minlenghtKeyMetadata);        
    }


    public static MinValue(min : number, message? : string)  
    {
        return function( target : Object, property : string)
        {            
            const constructor = typeof target == 'function' ? target : target.constructor;

            const prototype = typeof target == 'function' ? target.prototype : target;

            ValidationDecorators.AddField(constructor, property);

            let msg = message ?? `The field ${constructor.name}.${property} must be a minimum value of ${min}`;

            let minLengthValidation : IMinLengthValidation =  {Message : msg, Min : min};

            OwnMetadaContainer.Set(constructor, ValidationDecorators._minValueKeyMetadata, property, minLengthValidation);

            Reflect.defineMetadata(ValidationDecorators._minValueKeyMetadata, minLengthValidation , prototype, property);  
            
            
        }
    }

    public static GetMinValue(target : Function, property : string) : IMinLengthValidation | undefined
    {
        return ValidationDecorators.TryGetValue<IMinLengthValidation>(target, property, ValidationDecorators._minValueKeyMetadata);        
    }


    public static MaxValue(max : number, message? : string)  
    {
        return function( target : Object, property : string)
        {          
            const constructor = typeof target == 'function' ? target : target.constructor;

            const prototype = typeof target == 'function' ? target.prototype : target;  

            ValidationDecorators.AddField(constructor, property);

            let msg = message ?? `The field ${constructor.name}.${property} must be a maximun value of ${max}`;

            let maxLenghtValidation : IMaxLengthValidation = {Message : msg, Max : max};
            
            OwnMetadaContainer.Set(constructor, ValidationDecorators._maxValueKeyMetadata, property, maxLenghtValidation);

            Reflect.defineMetadata(ValidationDecorators._maxValueKeyMetadata, maxLenghtValidation , prototype, property);           
        }
    }

    public static GetMaxValue(target : Function, property : string) : IMaxLengthValidation | undefined
    {
        return ValidationDecorators.TryGetValue<IMaxLengthValidation>(target, property, ValidationDecorators._maxValueKeyMetadata);        
    }

    public static Regex(regex : RegExp, message? : string)  
    {
        return function( target : Object, property : string)
        {            
            const constructor = typeof target == 'function' ? target : target.constructor;

            const prototype = typeof target == 'function' ? target.prototype : target;

            let msg = message ?? `The field ${constructor.name}.${property} fails on validation expression`;

            let regexValidation : IRegexValidation = {Message : msg, RegExp : regex};

            ValidationDecorators.AddField(constructor, property);
            
            OwnMetadaContainer.Set(constructor, ValidationDecorators._regexKeyMetadata, property, regexValidation);

            Reflect.defineMetadata(ValidationDecorators._regexKeyMetadata, regexValidation, prototype, property);            
        }
    }

    public static GetRegex(target : Function, property : string) : IRegexValidation | undefined
    {
        return ValidationDecorators.TryGetValue<IRegexValidation>(target, property, ValidationDecorators._regexKeyMetadata);       

        
    }
    
    public static Rule<T extends Object, U extends keyof T>(validationFunction : (arg : T[U]) => boolean, message? : string)  
    {
        return function(target : T, property : U)
        {            
            const constructor = typeof target == 'function' ? target : target.constructor;

            const prototype = typeof target == 'function' ? (target as Function).prototype : target;

            let msg = message ?? `The field ${constructor.name}.${property.toString()} fails on validation expression`;

            let rules = ValidationDecorators.TryGetValue<IRuleValidation<T, U>[]>(constructor, property.toString(), ValidationDecorators._ruleKeyMetadata) ?? [];

            let ruleValidation = {
                Message : msg, 
                Function : validationFunction
            } as IRuleValidation<T, U>

            rules.push(ruleValidation);

            ValidationDecorators.AddField(constructor, property.toString());
            
            OwnMetadaContainer.Set(constructor, ValidationDecorators._ruleKeyMetadata, property.toString(), rules);

            Reflect.defineMetadata(ValidationDecorators._ruleKeyMetadata, rules, prototype, property.toString());            
        }
    }

    public static GetRules<T extends Object, U extends keyof T>(ctor : Function, property : string) :  IRuleValidation<T, U>[] 
    {
        return ValidationDecorators.TryGetValue<IRuleValidation<T, U>[]>(ctor, property, ValidationDecorators._ruleKeyMetadata) ?? [];         
    }



    public static Validate<T extends Object>(object : T) : IValidationResult[]
    {
        let result : IValidationResult[] = [];
        let objectAsAny = object as any;
        let ctor = objectAsAny.constructor;
       

        for(let k of Object.keys(object as any))
        {            
            let required = ValidationDecorators.IsRequired(ctor, k);
            let maxLenght = ValidationDecorators.GetMaxlenght(ctor, k);
            let minLenght = ValidationDecorators.GetMinlenght(ctor, k);
            let maxValue = ValidationDecorators.GetMaxValue(ctor, k);
            let minValue = ValidationDecorators.GetMinValue(ctor, k);
            let regex = ValidationDecorators.GetRegex(ctor, k);
            let rules = ValidationDecorators.GetRules(ctor, k);
            
            if(required)
            {
                if(!objectAsAny[k])
                    result.push({Field : k , Message : required.Message, Type: ctor});
            }

            if(maxLenght)
            {              
                if(objectAsAny[k] && (typeof objectAsAny[k] == "string" && objectAsAny[k].length > maxLenght.Max))
                    result.push({Field :  k , Message : maxLenght.Message, Type: ctor});
            }

            if(minLenght)
            {               
                if(!objectAsAny[k] || (typeof objectAsAny[k] == "string" && objectAsAny[k].length < minLenght.Min))
                    result.push({Field : k , Message : minLenght.Message, Type: ctor});
            }

            if(regex)
            {                
                if(!objectAsAny[k] || (typeof objectAsAny[k] == "string" && !regex.RegExp.test(objectAsAny[k] )))
                    result.push({Field : k , Message : regex.Message, Type: ctor});
            }

            if(minValue)
            {
               
                if(!objectAsAny[k] || (typeof objectAsAny[k] == "number" && objectAsAny[k] < minValue.Min))
                    result.push({Field :  k , Message : minValue.Message, Type: ctor});
            }

            if(maxValue )
            {
                
                if(!objectAsAny[k] || (typeof objectAsAny[k] == "number" && objectAsAny[k] > maxValue.Max))
                    result.push({Field :  k , Message : maxValue.Message, Type: ctor});
            }

            if(rules && rules.length > 0)
            {              
                for(let action of rules)
                {
                    let actionResult = false;

                    try{
                        actionResult = action.Function(objectAsAny[k]);
                    }catch{}

                    if(!actionResult)
                        result.push({Field :  k , Message : action.Message, Type : ctor});
                }
                
            }

            if(objectAsAny[k] != undefined && typeof objectAsAny[k] == 'object')
            {
                let propertyValidation = ValidationDecorators.Validate<typeof objectAsAny>(objectAsAny[k]);
                (result as any[]).push(...propertyValidation);
            }
        }

        return result;
    }

    private static TryGetValue<T>(ctor : Function, property : string, key : string)
    {
        let currentCtor = ctor;

        while(currentCtor != undefined)
        {

            let meta = Reflect.getMetadata(key, currentCtor.prototype, property);

            if(!meta)
            {
                let ownMeta = OwnMetadaContainer.Get(currentCtor, key, property);

                if(ownMeta)
                    meta = ownMeta.Value;            
            }

            if(meta)
                return meta as T;  

            if(currentCtor.prototype && currentCtor.prototype.__proto__)
                currentCtor = currentCtor.prototype.__proto__.constructor;
            else
                break;

        }
        
        return undefined;
    }

}

export interface IIgnoreOnValidation
{
    Type : Function, 
    Key : string
}

export interface IValidationWithMessage
{
    Message : string
}

export interface IValidationResult extends IValidationWithMessage
{
    Field: string, 
    Type: Function
}

export interface IRuleValidation<T extends Object, U extends keyof T> extends IValidationWithMessage
{     
    Function : (arg : T[U]) => boolean
}


export interface IRegexValidation extends IValidationWithMessage
{     
    RegExp : RegExp
} 


interface IMaxLengthValidation extends IValidationWithMessage
{     
    Max : number
} 

export interface IMinLengthValidation extends IValidationWithMessage
{     
    Min : number
} 


export abstract class ValidableClass
{
    public ValidateObject()
    {
        return ValidationDecorators.Validate(this);
    }
   
}