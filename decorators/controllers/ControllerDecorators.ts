import 'reflect-metadata';

import { HTTPVerbs } from '../../enums/httpVerbs/HttpVerbs';
import IController from '../../interfaces/IController';
import IMidleware from '../../midlewares/IMidleware';

export default class ControllersDecorators
{
    constructor()
    {

    }

    private static _routeKeyMetadata = "meta:controllerRoute";
    private static _actionVerbKeyMetadata = "meta:actionVerb";
    private static _actionNameKeyMetadata = "meta:actionName";
    private static _argumentsHandlerKeyMetadata = "meta:argHandler";
    private static _controllerMidlewaresKeyMetadata = "meta:controllerMidlewaresKey";
    private static _actionsMidlewaresKeyMetadata = "meta:actionMidlewaresKey";
    private static _validateBodyKeyMetadata = "meta:validateBodyKey";
    private static _fromQueryKeyMetadata = "meta:fromQueryKey";
    private static _fromBodyKeyMetadata = "meta:fromBodyKey";
    

    public static Route(route? : string)  
    {
        return function( target : Function)
        {
            let value = route ?? target.name.toLocaleLowerCase().replace("controller",""); 
            Reflect.defineMetadata(ControllersDecorators._routeKeyMetadata, value, target);
            
        }
    }

    public static GetRoute(controller : IController) : string | undefined
    {
       let meta = Reflect.getMetadata(ControllersDecorators._routeKeyMetadata, controller.constructor);

       if(meta && meta[0] != '/')
       {
            return `/${meta}`.toLocaleLowerCase();
       }

       return meta?.toLocaleLowerCase();

    }

    
    public static Validate()  
    {
        return function(target : Function)
        {            
            Reflect.defineMetadata(ControllersDecorators._validateBodyKeyMetadata, true, target);            
        }
    }

    public static IsToValidate(controller : IController) : boolean 
    {
       return Reflect.getMetadata(ControllersDecorators._validateBodyKeyMetadata, controller.constructor) ?? false;
    }

    public static Use(midleware : IMidleware)  
    {
        return function( target : Function)
        {
            let current : IMidleware[] = Reflect.getMetadata(ControllersDecorators._controllerMidlewaresKeyMetadata, target) ?? [];

            current.push(midleware);

            Reflect.defineMetadata(ControllersDecorators._controllerMidlewaresKeyMetadata, current, target);            
        }
    }

    public static GetMidlewares(controller : IController) : IMidleware[]
    {
       return Reflect.getMetadata(ControllersDecorators._controllerMidlewaresKeyMetadata, controller.constructor) ?? [];
    }

    public static Before(midleware : IMidleware)  
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            let current : IMidleware[] = Reflect.getMetadata(ControllersDecorators._actionsMidlewaresKeyMetadata, target, methodName) ?? [];

            current.push(midleware);

            ControllersDecorators.SetMetaData(ControllersDecorators._actionsMidlewaresKeyMetadata, target, methodName, current);
            
        }
    }

    public static GetBefores(controller : IController, methodName : string) : IMidleware[]
    {
       return this.GetMetaData<IMidleware[]>(ControllersDecorators._actionsMidlewaresKeyMetadata, controller, methodName) ?? [];
    }

    


    public static Verb(verb : HTTPVerbs, actionName? : String )  
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            ControllersDecorators.SetMetaData(ControllersDecorators._actionNameKeyMetadata, target, methodName, actionName ?? methodName.toLocaleLowerCase());
            ControllersDecorators.SetMetaData(ControllersDecorators._actionVerbKeyMetadata, target, methodName, verb);
            
        }
    }

    public static GetVerb(target : IController, methodName : string ) : HTTPVerbs | undefined
    {
        let meta = this.GetMetaData<HTTPVerbs>(ControllersDecorators._actionVerbKeyMetadata, target, methodName);

        return meta;
    }

    public static Action(actionName? : String)  
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            ControllersDecorators.SetMetaData(ControllersDecorators._actionNameKeyMetadata, target, methodName, actionName ?? methodName.toLocaleLowerCase());
            
        }
    }

    public static GetAction(target : IController, methodName : string ) : string | undefined
    {
        let meta = this.GetMetaData<string>(ControllersDecorators._actionNameKeyMetadata, target, methodName);

        if(meta && meta[0] != '/')
        {  
            return `/${meta}`.toLocaleLowerCase();
        }

        return meta?.toLocaleLowerCase();
    }

    public static FromBody(bodyPropName? : string)
    {
        return function( target : Object, methodName: string , parameterIndex: number)
        {
            let meta = ControllersDecorators.GetFromBodyArgs(target.constructor, methodName);

            let item = meta.filter(x => x.Index == parameterIndex);

            if(item.length == 0)
                meta.push({Index : parameterIndex, Field : bodyPropName });
            else {
                item[0].Field = bodyPropName;
            }

            Reflect.defineMetadata(ControllersDecorators._fromBodyKeyMetadata, meta, target.constructor, methodName);            
        }
    }

    public static GetFromBodyArgs(target : Function, method : string) : {Index : number, Field? : string }[]
    {
        return Reflect.getMetadata(ControllersDecorators._fromBodyKeyMetadata, target, method) ?? [];
    }

    public static FromQuery(bodyPropName? : string)
    {
        return function( target : Object, methodName: string , parameterIndex: number)
        {
            let meta = ControllersDecorators.GetFromQueryArgs(target.constructor, methodName);

            let item = meta.filter(x => x.Index == parameterIndex);

            if(item.length == 0)
                meta.push({Index : parameterIndex, Field : bodyPropName });
            else {
                item[0].Field = bodyPropName;
            }

            Reflect.defineMetadata(ControllersDecorators._fromQueryKeyMetadata, meta, target.constructor, methodName);             
        }
    }
   
    public static GetFromQueryArgs(target : Function, method : string) :  {Index : number, Field? : string }[]
    {
        return Reflect.getMetadata(ControllersDecorators._fromQueryKeyMetadata, target, method) ?? [];
    }
    
    
    private static SetMetaData<T>(key: string, target : Object, methodName : string, value : T)
    {
        var meta = Reflect.getOwnMetadata(key, target as Object, methodName);
    
        if(!meta)
            Reflect.defineMetadata(key, value, target as Object, methodName);
    }


    private static GetMetaData<T>(key: string, target : Object, methodName : string) : T | undefined
    {
        var meta = Reflect.getMetadata(key, target, methodName);
    
        if(meta != undefined)
            return meta as T;
        else 
            return undefined;
    }    

}

