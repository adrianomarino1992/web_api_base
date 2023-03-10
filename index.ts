export { default as Application } from "./Application"
export { default as ApplicationConfiguration } from "./ApplicationConfiguration";

export { default as ControllersDecorators } from "./decorators/controllers/ControllerDecorators";
export { ControllerBase } from "./controllers/base/ControllerBase";

export { HTTPVerbs } from './enums/httpVerbs/HttpVerbs';

export { default as DependecyService } from "./dependencyInjection/DependecyService";

export { default as IMidleware } from './midlewares/IMidleware';
export { default as IApplicationConfiguration } from "./interfaces/IApplicationConfiguration"; 
export { default as IApplication } from "./interfaces/IApplication"; 
export { default as IApplicatiIControllernConfiguration } from "./interfaces/IController"; 


import ControllersDecorators from "./decorators/controllers/ControllerDecorators";
import DependecyService from "./dependencyInjection/DependecyService";
import { HTTPVerbs } from "./enums/httpVerbs/HttpVerbs";
import IMidleware from "./midlewares/IMidleware";

export function Use(midleware : IMidleware)  
{
    return ControllersDecorators.Use(midleware); 
} ;

export function Run(midleware : IMidleware)    
{
    return ControllersDecorators.Before(midleware); 
} ;

export function Action(actionName : String)     
{
    return ControllersDecorators.Action(actionName); 
} ;

export function Route(route : string)       
{
    return ControllersDecorators.Route(route); 
} ;


export function Verb(verb : HTTPVerbs)      
{

    return ControllersDecorators.Verb(verb); 
} ;

export function Inject()
{
    return DependecyService.Injectable();
}

export function InjectAbstract(object : Function)
{
    return DependecyService.InjectOne(object);
}



export function Argument<T>(argName1 : string) : ( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor) => void;
export function Argument<T, U>(argName1 : string, argName2? : string) : ( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor) => void ;
export function Argument<T, U, K>(argName1 : string, argName2? : string, argName3? : string) : ( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor) => void;
export function Argument<T, U, K, Y>(argName1 : string, argName2? : string, argName3? : string, argName4? : string) : ( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor) => void; 
export function Argument<T, U , K, Y, J>(argName1 : string, argName2? : string, argName3? : string, argName4? : string, argName5? : string) : ( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor) => void
{
    return ControllersDecorators.Argument<T, U , K, Y, J>(argName1, argName2, argName3, argName4, argName5);
}




