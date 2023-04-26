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
import ValidationDecorators from "./decorators/validations/ValidationDecorators";
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

export function Action(actionName? : String)     
{
    return ControllersDecorators.Action(actionName); 
} ;

export function Route(route? : string)       
{
    return ControllersDecorators.Route(route); 
} ;

export function GET(action? : string)       
{
    return ControllersDecorators.Verb(HTTPVerbs.GET, action); 
} ;

export function POST(action? : string)       
{
    return ControllersDecorators.Verb(HTTPVerbs.POST, action); 
} ;

export function PUT(action? : string)       
{
    return ControllersDecorators.Verb(HTTPVerbs.PUT, action); 
} ;

export function DELETE(action? : string)       
{
    return ControllersDecorators.Verb(HTTPVerbs.DELETE, action); 
} ;


export function Verb(verb : HTTPVerbs)      
{
    return ControllersDecorators.Verb(verb); 
} ;

export function Inject()
{
    return DependecyService.Injectable();
}

export function InjectAbstract(cTor : Function)
{
    return DependecyService.InjectOne(cTor);
}

export function Validate()
{
    return ControllersDecorators.Validate();
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

export function Regex(regex: RegExp, message?: string)
{
    return ValidationDecorators.Regex(regex, message);
}

export function Rule<T>(action: (a : T) => boolean, message?: string)
{
    return ValidationDecorators.Rule<T>(action, message);
}

export function FromBody(paramName? : string)
{
    return ControllersDecorators.FromBody(paramName);
}

export function FromQuery(paramName? : string)
{
    return ControllersDecorators.FromQuery(paramName);
}





