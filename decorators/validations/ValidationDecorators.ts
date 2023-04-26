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
        let meta = Reflect.getMetadata(ValidationDecorators._requiredKeyMetadata, target, property) ?? 
                   Reflect.getMetadata(ValidationDecorators._requiredKeyMetadata, target.constructor, property);
        if(!meta)
        {
            let ownMeta = OwnMetadaContainer.Get(target, ValidationDecorators._requiredKeyMetadata, property);

            if(ownMeta)
                meta = ownMeta.Value;            
        }

        return meta;
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
        return Reflect.getMetadata(ValidationDecorators._maxlenghtKeyMetadata, target, property);
    }

    public static MinLenght(min : number, message? : string)  
    {
        return function( target : Object, property : string)
        {            
            ValidationDecorators.AddField(target, property);
            let msg = message ?? `The field ${target.constructor.name}.${property} must be a minimum of ${min} caracteres`;
            OwnMetadaContainer.Set(target.constructor, ValidationDecorators._minlenghtKeyMetadata, property, {Message : msg, Min : min});
            Reflect.defineMetadata(ValidationDecorators._maxlenghtKeyMetadata, {Message : msg, Min : min} , target, property);           
        }
    }

    public static GetMinlenght(target : Object, property : string) : {Message : string, Min : number} | undefined
    {
        return Reflect.getMetadata(ValidationDecorators._minlenghtKeyMetadata, target, property);
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


    public static Validate<T>(object : T) : string[]
    {
        let result : string[] = [];
        let o = object as any;

        for(let k of ValidationDecorators.GetFields(o))
        {            
            let required = ValidationDecorators.IsRequired(o, k);
            let max = ValidationDecorators.GetMaxlenght(o, k);
            let min = ValidationDecorators.GetMinlenght(o, k);
            let regex = ValidationDecorators.GetRegex(o, k);
            let action = ValidationDecorators.GetRule(o, k);
            
            if(required)
            {
                if(!o[k])
                    result.push(required.Message);
            }

            if(max)
            {
                if(o[k] && (typeof o[k] == "string" && o[k].length > max.Max))
                    result.push(max.Message);
            }

            if(min)
            {
                if(!o[k] || (typeof o[k] == "string" && o[k].length > min.Min))
                    result.push(min.Message);
            }

            if(regex)
            {
                if(!o[k] || (typeof o[k] == "string" && !regex.RegExp.test(o[k] )))
                    result.push(regex.Message);
            }

            if(action)
            {
                let actionResult = false;

                try{
                    actionResult = action.Function(o[k]);
                }catch{}

                if(!actionResult)
                    result.push(action.Message);
            }
        }

        return result;
    }

}