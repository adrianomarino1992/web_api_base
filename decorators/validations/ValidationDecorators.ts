import 'reflect-metadata';
import OwnMetadaContainer from '../../metadata/OwnMetaDataContainer';


export default class ValidationDecorators
{
    constructor()
    {

    }

    private static _requiredKeyMetadata = "meta:validation-required";
    private static _maxlenghtKeyMetadata = "meta:validation-maxLenght";
    private static _minlenghtKeyMetadata = "meta:validation-minLenght";
    private static _regexKeyMetadata = "meta:validation-regex";
    private static _ruleKeyMetadata = "meta:validation-rule";
    private static _maxValueKeyMetadata = "meta:validation-maxValue";
    private static _minValueKeyMetadata = "meta:validation-minValue";
    private static _keysToValidateKeyMetada = "meta:mustValidate";


    public static AddField(target : Object, property : string)
    {
        let meta = this.GetFields(target);        
        meta.push(property);
        Reflect.defineMetadata(ValidationDecorators._keysToValidateKeyMetada, meta, target.constructor);
        OwnMetadaContainer.Set(target.constructor, ValidationDecorators._keysToValidateKeyMetada, undefined, meta);
    }

    public static GetFields(target : Object) : string[]
    {
        let meta = Reflect.getMetadata(ValidationDecorators._keysToValidateKeyMetada, target) ?? 
        Reflect.getMetadata(ValidationDecorators._keysToValidateKeyMetada, target.constructor);

        if(!meta)
        {
            let ownMeta = OwnMetadaContainer.Get(target, ValidationDecorators._keysToValidateKeyMetada);

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
            ValidationDecorators.AddField(target, property);
            let msg = message ?? `The field ${target.constructor.name}.${property} is required`;
            OwnMetadaContainer.Set(target.constructor, ValidationDecorators._requiredKeyMetadata, property, { Message : msg});
            Reflect.defineMetadata(ValidationDecorators._requiredKeyMetadata, { Message : msg}, target, property);            
        }
    }

    public static IsRequired(target : Object, property : string) : {Message : string} | undefined
    {
        return ValidationDecorators.TryGetValue<ReturnType<typeof ValidationDecorators.IsRequired>>(target, property, ValidationDecorators._requiredKeyMetadata);
    }

    public static MaxLenght(max : number, message? : string)  
    {        
        return function( target : Object, property : string)
        {            
            ValidationDecorators.AddField(target, property);
            let msg = message ?? `The field ${target.constructor.name}.${property} must be a maximum of ${max} caracteres`;
            OwnMetadaContainer.Set(target.constructor, ValidationDecorators._maxlenghtKeyMetadata, property, {Message : msg, Max : max});
            Reflect.defineMetadata(ValidationDecorators._maxlenghtKeyMetadata, {Message : msg, Max : max} , target, property);            
        }
    }

    public static GetMaxlenght(target : Object, property : string) : {Message : string, Max : number}  | undefined
    {
        return ValidationDecorators.TryGetValue<ReturnType<typeof ValidationDecorators.GetMaxlenght>>(target, property, ValidationDecorators._maxlenghtKeyMetadata);        
    }

    public static MinLenght(min : number, message? : string)  
    {
        return function( target : Object, property : string)
        {            
            ValidationDecorators.AddField(target, property);
            let msg = message ?? `The field ${target.constructor.name}.${property} must be a minimum of ${min} caracteres`;
            OwnMetadaContainer.Set(target.constructor, ValidationDecorators._minlenghtKeyMetadata, property, {Message : msg, Min : min});
            Reflect.defineMetadata(ValidationDecorators._minlenghtKeyMetadata, {Message : msg, Min : min} , target, property);           
        }
    }

    public static GetMinlenght(target : Object, property : string) : {Message : string, Min : number} | undefined
    {
        return ValidationDecorators.TryGetValue<ReturnType<typeof ValidationDecorators.GetMinlenght>>(target, property, ValidationDecorators._minlenghtKeyMetadata);        
    }


    public static MinValue(min : number, message? : string)  
    {
        return function( target : Object, property : string)
        {            
            ValidationDecorators.AddField(target, property);
            let msg = message ?? `The field ${target.constructor.name}.${property} must be a minimum value of ${min}`;
            OwnMetadaContainer.Set(target.constructor, ValidationDecorators._minValueKeyMetadata, property, {Message : msg, Min : min});
            Reflect.defineMetadata(ValidationDecorators._minValueKeyMetadata, {Message : msg, Min : min} , target, property);           
        }
    }

    public static GetMinValue(target : Object, property : string) : {Message : string, Min : number} | undefined
    {
        return ValidationDecorators.TryGetValue<ReturnType<typeof ValidationDecorators.GetMinValue>>(target, property, ValidationDecorators._minValueKeyMetadata);        
    }


    public static MaxValue(max : number, message? : string)  
    {
        return function( target : Object, property : string)
        {            
            ValidationDecorators.AddField(target, property);
            let msg = message ?? `The field ${target.constructor.name}.${property} must be a maximun value of ${max}`;
            OwnMetadaContainer.Set(target.constructor, ValidationDecorators._maxValueKeyMetadata, property, {Message : msg, Max : max});
            Reflect.defineMetadata(ValidationDecorators._maxValueKeyMetadata, {Message : msg, Max : max} , target, property);           
        }
    }

    public static GetMaxValue(target : Object, property : string) : {Message : string, Max : number} | undefined
    {
        return ValidationDecorators.TryGetValue<ReturnType<typeof ValidationDecorators.GetMaxValue>>(target, property, ValidationDecorators._maxValueKeyMetadata);        
    }

    public static Regex(regex : RegExp, message? : string)  
    {
        return function( target : Object, property : string)
        {            
            ValidationDecorators.AddField(target, property);
            let msg = message ?? `The field ${target.constructor.name}.${property} fails on validation expression`;
            OwnMetadaContainer.Set(target.constructor, ValidationDecorators._regexKeyMetadata, property, {Message : msg, RegExp : regex});
            Reflect.defineMetadata(ValidationDecorators._regexKeyMetadata, {Message : msg, RegExp : regex}, target, property);            
        }
    }

    public static GetRegex(target : Object, property : string) : {Message : string, RegExp : RegExp} | undefined
    {
        return Reflect.getMetadata(ValidationDecorators._regexKeyMetadata, target, property);
    }
    
    public static Rule<T>(validationFunction : (arg : T) => boolean, message? : string)  
    {
        return function( target : Object, property : string)
        {            
            ValidationDecorators.AddField(target, property);
            let msg = message ?? `The field ${target.constructor.name}.${property} fails on validation expression`;
            OwnMetadaContainer.Set(target.constructor, ValidationDecorators._ruleKeyMetadata, property, {Message : msg, Function : validationFunction});
            Reflect.defineMetadata(ValidationDecorators._ruleKeyMetadata, {Message : msg, Function : validationFunction}, target, property);            
        }
    }

    public static GetRule<T>(target : Object, property : string) :  {Message : string, Function : (arg : T) => boolean} | undefined
    {
        return Reflect.getMetadata(ValidationDecorators._ruleKeyMetadata, target, property);
    }


    public static Validate<T>(object : T) : {Field : string, Message: string}[]
    {
        let result : {Field : string, Message: string}[] = [];
        let o = object as any;
        let cache : {f : string, k : string}[] = [];

        for(let k of ValidationDecorators.GetFields(o))
        {            
            let required = ValidationDecorators.IsRequired(o, k);
            let maxLenght = ValidationDecorators.GetMaxlenght(o, k);
            let minLenght = ValidationDecorators.GetMinlenght(o, k);
            let maxValue = ValidationDecorators.GetMaxValue(o, k);
            let minValue = ValidationDecorators.GetMinValue(o, k);
            let regex = ValidationDecorators.GetRegex(o, k);
            let action = ValidationDecorators.GetRule(o, k);
            
            if(required && cache.filter(c => c.f == k && c.k == "r").length == 0)
            {
                cache.push({f : k, k : "r"});

                if(!o[k])
                    result.push({Field : k , Message : required.Message});
            }

            if(maxLenght && cache.filter(c => c.f == k && c.k == "ml").length == 0)
            {
                cache.push({f : k, k : "ml"});
                if(o[k] && (typeof o[k] == "string" && o[k].length > maxLenght.Max))
                    result.push({Field : k , Message : maxLenght.Message});
            }

            if(minLenght && cache.filter(c => c.f == k && c.k == "nl").length == 0)
            {
                cache.push({f : k, k : "nl"});
                if(!o[k] || (typeof o[k] == "string" && o[k].length < minLenght.Min))
                    result.push({Field : k , Message : minLenght.Message});
            }

            if(regex && cache.filter(c => c.f == k && c.k == "rg").length == 0)
            {
                cache.push({f : k, k : "rg"});
                if(!o[k] || (typeof o[k] == "string" && !regex.RegExp.test(o[k] )))
                    result.push({Field : k , Message : regex.Message});
            }

            if(minValue && cache.filter(c => c.f == k && c.k == "mv").length == 0)
            {
                cache.push({f : k, k : "mv"});
                if(!o[k] || (typeof o[k] == "number" && o[k] < minValue.Min))
                    result.push({Field : k , Message : minValue.Message});
            }

            if(maxValue && cache.filter(c => c.f == k && c.k == "nv").length == 0)
            {
                cache.push({f : k, k : "nv"});
                if(!o[k] || (typeof o[k] == "number" && o[k] > maxValue.Max))
                    result.push({Field : k , Message : maxValue.Message});
            }

            if(action && cache.filter(c => c.f == k && c.k == "a").length == 0)
            {
                cache.push({f : k, k : "a"});
                
                let actionResult = false;

                try{
                    actionResult = action.Function(o[k]);
                }catch{}

                if(!actionResult)
                    result.push({Field : k , Message : action.Message});
            }
        }

        return result;
    }

    private static TryGetValue<T>(target : Object, property : string, key : string)
    {
        let meta = Reflect.getMetadata(key, target, property) ?? 
                   Reflect.getMetadata(key, target.constructor, property);
        if(!meta)
        {
            let ownMeta = OwnMetadaContainer.Get(target, key, property);

            if(ownMeta)
                meta = ownMeta.Value;            
        }

        return meta as T;  
    }

}