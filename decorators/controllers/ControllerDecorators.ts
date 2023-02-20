import { REFUSED } from 'dns';
import 'reflect-metadata';

import { HTTPVerbs } from '../../enums/httpVerbs/HttpVerbs';
import IController from '../../interfaces/IController';
import IMidleware from '../../midlewares/IMidleware';

export default class ControllersDecorators
{
    constructor()
    {

    }

    private static RouteKeyMetadata = "meta:controllerRoute";
    private static ActionVerbKeyMetadata = "meta:actionVerb";
    private static ActionNameKeyMetadata = "meta:actionName";
    private static ArgumentsHandlerKeyMetadata = "meta:argHandler";
    private static ControllerMidlewaresKeyMetadata = "meta:controllerMidlewaresKey";
    private static ActionsMidlewaresKeyMetadata = "meta:actionMidlewaresKey";
    

    public static Route(route : string)  
    {
        return function( target : Function)
        {
            Reflect.defineMetadata(ControllersDecorators.RouteKeyMetadata, route, target);
            
        }
    }

    public static Use(midleware : IMidleware)  
    {
        return function( target : Function)
        {
            let current : IMidleware[] = Reflect.getMetadata(ControllersDecorators.ControllerMidlewaresKeyMetadata, target) ?? [];

            current.push(midleware);

            Reflect.defineMetadata(ControllersDecorators.ControllerMidlewaresKeyMetadata, current, target);            
        }
    }

    public static GetMidlewares(controller : IController) : IMidleware[]
    {
       return Reflect.getMetadata(ControllersDecorators.ControllerMidlewaresKeyMetadata, controller.constructor) ?? [];
    }

    public static Before(midleware : IMidleware)  
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            let current : IMidleware[] = Reflect.getMetadata(ControllersDecorators.ActionsMidlewaresKeyMetadata, target, methodName) ?? [];

            current.push(midleware);

            ControllersDecorators.SetMetaData(ControllersDecorators.ActionsMidlewaresKeyMetadata, target, methodName, current);
            
        }
    }

    public static GetBefores(controller : IController, methodName : string) : IMidleware[]
    {
       return this.GetMetaData<IMidleware[]>(ControllersDecorators.ActionsMidlewaresKeyMetadata, controller, methodName) ?? [];
    }

    public static GetRoute(controller : IController) : string | undefined
    {
       return Reflect.getMetadata(ControllersDecorators.RouteKeyMetadata, controller.constructor);
    }


    public static Verb(verb : HTTPVerbs)  
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            ControllersDecorators.SetMetaData(ControllersDecorators.ActionVerbKeyMetadata, target, methodName, verb);
            
        }
    }

    public static GetVerb(target : IController, methodName : string ) : HTTPVerbs | undefined
    {
        let meta = this.GetMetaData<HTTPVerbs>(ControllersDecorators.ActionVerbKeyMetadata, target, methodName);

        return meta;
    }

    public static Action(actionName : String)  
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            ControllersDecorators.SetMetaData(ControllersDecorators.ActionNameKeyMetadata, target, methodName, actionName);
            
        }
    }

    public static GetAction(target : IController, methodName : string ) : string | undefined
    {
        let meta = this.GetMetaData<string>(ControllersDecorators.ActionNameKeyMetadata, target, methodName);

        return meta;
    }
   
    
    public static Argument<T>(argName1 : string) : ( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor) => void
    public static Argument<T, U>(argName1 : string, argName2?: string)  : ( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor) => void
    public static Argument<T, U, K>(argName1 : string, argName2?: string, argName3? : string)  : ( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor) => void
    public static Argument<T, U, K, Y>(argName1 : string, argName2?: string, argName3? : string, argName4? : string)  : ( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor) => void
    public static Argument<T, U, K, Y, J>(argName1 : string, argName2?: string, argName3? : string, argName4? : string, argName5? : string)  : ( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor) => void
    public static Argument<T, U, K, Y, J, V>(argName1 : string, argName2?: string, argName3? : string, argName4? : string, argName5? : string, argName6? : string)  : ( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor) => void
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            ControllersDecorators.SetMetaData(ControllersDecorators.ArgumentsHandlerKeyMetadata, target, methodName, 
                {
                    

                    Arguments : [argName1, argName2, argName3, argName4, argName5, argName6],

                    CreateArgumentsList : (args : any) => 
                    {
                        let results = [] as any[];

                        
                        if (argName1 && (args[argName1] as unknown as T) != undefined) 
                            results[0] = args[argName1] as T;

                        if (argName2 && (args[argName2] as unknown as U) != undefined) 
                            results[1] = args[argName2] as U;
            
                        if (argName3 && (args[argName3] as unknown as K) != undefined) 
                            results[2] = args[argName3] as K;
            
                        if (argName4 && (args[argName4] as unknown as Y) != undefined) 
                            results[3] = args[argName4] as Y;
            
                        if (argName5 && (args[argName5] as unknown as J) != undefined) 
                            results[4] = args[argName5] as J;
            
                        if (argName6 && (args[argName6] as unknown as V) != undefined) 
                            results[5] = args[argName6] as V;

                        return results;

                    } 
                });
            
        }
    }

    

    public static GetArgumentsHandler(target : IController, methodName : string ) : IArgumentResolverHandler | undefined
    {
        let handler = this.GetMetaData<IArgumentResolverHandler>(ControllersDecorators.ArgumentsHandlerKeyMetadata, target, methodName);

        return handler;
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
interface IArgumentResolverHandler
{
    Arguments : string[];
    CreateArgumentsList : (args :any) => any[];
}


