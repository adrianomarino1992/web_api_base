import 'reflect-metadata';

export { default as Application } from "./Application"
export { default as ApplicationConfiguration } from "./ApplicationConfiguration";

export { default as ControllersDecorators } from "./decorators/controllers/ControllerDecorators";
export { ControllerBase } from "./controllers/base/ControllerBase";

export { HTTPVerbs } from './enums/httpVerbs/HttpVerbs';

export { default as Exception } from './exceptions/Exception';

import FileService from './file/FileService';
import AbstractFileService from './file/AbstractFileService';

export {FileService, AbstractFileService};

export { default as File } from './file/File';

export { default as DependecyService } from "./dependencyInjection/DependecyService";

export { default as IMidleware } from './midlewares/IMidleware';
export { default as IApplicationConfiguration } from "./interfaces/IApplicationConfiguration"; 
export { default as IApplication } from "./interfaces/IApplication"; 
export { default as IApplicatiIControllernConfiguration } from "./interfaces/IController"; 
export { IHTTPRequestContext, IRequestResult, IRequestResultHandler } from "./midlewares/IMidleware";

export { default as ActionResult } from './controllers/ActionResult';
export { default as AcceptedResult} from './controllers/AcceptedResult';
export { default as BadRequestResult } from './controllers/BadRequestResult';
export { default as CreatedResult } from './controllers/CreatedResult';
export { default as ErrorResult } from './controllers/ErrorResult';
export { default as ForbiddenResult } from './controllers/ForbiddenResult';
export { default as GenericResult } from './controllers/GenericResult';
export { default as NoContentResult } from './controllers/NoContentResult';
export { default as NotFoundResult } from './controllers/NotFoundResult';
export { default as OKResult } from './controllers/OKResult';
export { default as UnauthorizedResult } from './controllers/UnauthorizedResult';



import ControllersDecorators from "./decorators/controllers/ControllerDecorators";
import { DocumentationDecorators } from "./decorators/documentation/DocumentationDecorators";
import ValidationDecorators from "./decorators/validations/ValidationDecorators";
import DependecyService from "./dependencyInjection/DependecyService";
import { HTTPVerbs } from "./enums/httpVerbs/HttpVerbs";
import IMidleware, { IRequestResultHandler } from "./midlewares/IMidleware";
import MetadataDecorators from './decorators/metadata/MetadataDecorators';
import OwnMetaDataContainer from './metadata/OwnMetaDataContainer';


export {default as BodyParseException} from "./exceptions/BodyParseException";
export {default as ControllerLoadException} from "./exceptions/ControllerLoadException";
export {default as ArgumentNullException} from "./exceptions/ArgumentNullException";
export {default as FindDependencyException} from "./exceptions/FindDependencyException";
export {default as DecoratorException} from "./exceptions/DecoratorException";
export {default as InvalidEntityException} from "./exceptions/InvalidEntityException";
export {default as FileNotFoundException} from "./exceptions/FileNotFoundException";



export function CreateMetada()
{
    return MetadataDecorators.CreateMetada();
}


export function IgnoreInDocumentation()
{
    return MetadataDecorators.IgnoreInDocumentation();
}

export function ShowInDocumentation()
{
    return MetadataDecorators.ShowInDocumentation();
}

export function ArrayElementType(typeBuilder : () => new (...args: any[])=> any)
{
    return MetadataDecorators.ArrayElementType(typeBuilder);
}


export function DefaultValue(value: any) 
{
    return MetadataDecorators.DefaultValue(value);
}

    

export function UseBefore(midleware : IMidleware)  
{
    return ControllersDecorators.UseBefore(midleware); 
} ;

export function RunBefore(midleware : IMidleware)    
{
    return ControllersDecorators.RunBefore(midleware); 
} ;

export function UseAfter(resultHandler : IRequestResultHandler)  
{
    return ControllersDecorators.UseAfter(resultHandler); 
} ;

export function RunAfter(resultHandler : IRequestResultHandler)    
{
    return ControllersDecorators.RunAfter(resultHandler); 
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


export function ControllerHeader(header : string)       
{
    return DocumentationDecorators.ControllerHeader(header); 
} ;


export function ActionHeader(header : string)       
{
    return DocumentationDecorators.ActionHeader(header); 
} ;

export function Description(description : string)       
{
    return DocumentationDecorators.Description(description); 
} ;

export function RequestJson(json : string)       
{
    return DocumentationDecorators.RequestJson(json); 
} ;


export function ProducesResponse(response : Parameters<typeof DocumentationDecorators.ProducesResponse>[0])       
{
    return DocumentationDecorators.ProducesResponse(response); 
} ;




export function Verb(verb : HTTPVerbs)      
{
    return ControllersDecorators.Verb(verb); 
} ;

export function Inject()
{
    return DependecyService.Injectable();
}


export function InjectOne(constructorFunction: Function, genericArgumentType? : Function)
{
    return DependecyService.InjectOne(constructorFunction, genericArgumentType);
}

export function InjectGenericTypeArgument(constructorFunction: Function, genericArgumentType : Function)
{
    return DependecyService.InjectGenericType(constructorFunction, genericArgumentType);
       
}

export function InjectTypeArgument(genericArgumentType : Function)
{
    return function(target : Object, property : string | symbol) : void 
    {
        OwnMetaDataContainer.Set(target.constructor, DependecyService["_injectableTypeKey"], property.toString(), {Type: Reflect.getMetadata("design:type", target, property), GenericType: genericArgumentType});
    }           
}


export function InjectAbstract(cTor : Function)
{
    return DependecyService.InjectOne(cTor);
}

export function Validate()
{
    return ControllersDecorators.Validate();
}

export function ValidateObject<T>(obj : T)
{
    return ValidationDecorators.Validate<T>(obj);
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

export function Rule<T>(action: (a : T) => boolean, message?: string)
{
    return ValidationDecorators.Rule<T>(action, message);
}

export function RequiredFromBodyArg(paramName? : string)
{
    return ControllersDecorators.RequiredFromBodyArg(paramName);
}


export function OptionalFromBodyArg(paramName? : string)
{
    return ControllersDecorators.OptionalFromBodyArg(paramName);
}

export function FromBody(paramName? : string, required? : boolean)
{
    return ControllersDecorators.FromBody(paramName, required);
}

export function FromFiles(fileName? : string, required? : boolean)
{
    return ControllersDecorators.FromFiles(fileName, required);
}

export function MaxFilesSize(bytes : number)
{
    return ControllersDecorators.MaxFilesSize(bytes);
}

export function RequiredFromQueryArg(paramName? : string)
{
    return ControllersDecorators.RequiredFromQueryArg(paramName);
}

export function OptionalFromQueryArg(paramName? : string)
{
    return ControllersDecorators.OptionalFromQueryArg(paramName);
}


export function FromQuery(paramName? : string, required? : boolean)
{
    return ControllersDecorators.FromQuery(paramName, required);
}







