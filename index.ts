import OwnMetaDataContainer from "./metadata/OwnMetaDataContainer";


// #region REFLECT-METADATA HOOK

const noHooksArg = process.argv.filter(arg => arg.toLowerCase() == '--donothook-reflect').length > 0;
const noHookEnv = !!process.env["DO_NOT_HOOK_REFLECT"]

if(!noHookEnv && !noHooksArg)
{
    const metadata = Reflect.metadata;

    if(!metadata)
        throw new Error("Metadata functions were not found on the global Reflect object. Please verify that the 'reflect-metadata' package is properly imported.");


    (Reflect as any).metadata = function(...args: any[]){

        const decoratorFunction = (metadata as Function).apply(Reflect, args);

        try
        {
            const key = args[0];
            const value = args[1];

            return function(...params: any[])
            {
                try
                {
                    const type = typeof params[0] == 'function' ? params[0] : params[0].constructor;
                    const prop = params[1];
                    OwnMetaDataContainer.Set(type, key, prop, value);
                }
                catch(e)
                {
                    console.log("Error inside reflect-metadata hook", e);
                }
                

                return decoratorFunction(...params);
            }
        }
        catch(e)
        {
            console.log("Error on reflect-metadata hook", e);
            return decoratorFunction;
        }
    }
}

// #endregion





// #region IMPORTS

export { default as Application } from "./Application"
export { default as ApplicationConfiguration } from "./ApplicationConfiguration";

export { default as ControllersDecorators } from "./decorators/controllers/ControllerDecorators";
export { ControllerBase } from "./controllers/base/ControllerBase";

export { HTTPVerbs } from './enums/httpVerbs/HttpVerbs';

export { default as Exception } from './exceptions/Exception';

import FileService from './files/FileService';
import AbstractFileService from './files/AbstractFileService';

export {FileService, AbstractFileService};

export { default as File } from './files/File';

import DependecyService from "./dependencyInjection/DependecyService";

export { DependecyService };

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
import { HTTPVerbs } from "./enums/httpVerbs/HttpVerbs";
import IMidleware, { IRequestResultHandler } from "./midlewares/IMidleware";
import MetadataDecorators from './decorators/metadata/MetadataDecorators';
export {default as BodyParseException} from "./exceptions/BodyParseException";
export {default as ControllerLoadException} from "./exceptions/ControllerLoadException";
export {default as ArgumentNullException} from "./exceptions/ArgumentNullException";
export {default as FindDependencyException} from "./exceptions/FindDependencyException";
export {default as DecoratorException} from "./exceptions/DecoratorException";
export {default as InvalidEntityException} from "./exceptions/InvalidEntityException";
export {default as FileNotFoundException} from "./exceptions/FileNotFoundException";

// #endregion





// #region CONTROLLERS DECORATORS

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

export function OmmitOnRoute()       
{
    return ControllersDecorators.OmmitOnRoute(); 
} ;

export function OmmitActionNameOnRoute()       
{
    return ControllersDecorators.OmmitActionName(); 
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



// #endregion






// #region METHODS PARAMS

export function RequiredFromBodyArg(paramName? : string, notProvidedMessage?: string)
{
    return ControllersDecorators.RequiredFromBodyArg(paramName, notProvidedMessage);
}


export function OptionalFromBodyArg(paramName? : string)
{
    return ControllersDecorators.OptionalFromBodyArg(paramName);
}

export function FromBody(paramName? : string, required? : boolean, notProvidedMessage?: string)
{
    return ControllersDecorators.FromBody(paramName, required, notProvidedMessage);
}



export function RequiredFromFileArg(fileName? : string, fileNotProvidedMessage?: string)
{
    return ControllersDecorators.RequiredFromFilesArg(fileName, fileNotProvidedMessage);
}

export function OptionalFromFileArg(fileName? : string)
{
    return ControllersDecorators.OptionalFromFilesArg(fileName);
}

export function FromFiles(fileName? : string, required? : boolean, fileNotProvidedMessage? : string)
{
    return ControllersDecorators.FromFiles(fileName, required, fileNotProvidedMessage);
}


export function MaxFilesSize(bytes : number, fileBiggerThanMaxMessage?: string)
{
    return ControllersDecorators.MaxFilesSize(bytes, fileBiggerThanMaxMessage);
}

export function MaxFileSize(bytes : number, fileBiggerThanMaxMessage?: string)
{
    return ControllersDecorators.MaxFileSize(bytes, fileBiggerThanMaxMessage);
}

export function RequiredFromQueryArg(paramName? : string, notProvidedMessage?: string)
{
    return ControllersDecorators.RequiredFromQueryArg(paramName, notProvidedMessage);
}

export function OptionalFromQueryArg(paramName? : string)
{
    return ControllersDecorators.OptionalFromQueryArg(paramName);
}


export function FromQuery(paramName? : string, required? : boolean, notProvidedMessage?: string)
{
    return ControllersDecorators.FromQuery(paramName, required, notProvidedMessage);
}


export function FromPath(paramName? : string)
{
    return ControllersDecorators.FromPath(paramName);
}




// #endregion









// #region METADATA



export function CreateMetada()
{
    return MetadataDecorators.CreateMetada();
}

export function ArrayElementType(typeBuilder : () => new (...args: any[])=> any)
{
    return MetadataDecorators.ArrayElementType(typeBuilder);
}

export function DefaultValue(value: any) 
{
    return MetadataDecorators.DefaultValue(value);
}

export function JSONProperty(jsonPropertyName: string)
{
    return MetadataDecorators.JSONPropertyName(jsonPropertyName);
}


// #endregion









// #region DOCUMENTATION

export function IgnoreInDocumentation()
{
    return MetadataDecorators.IgnoreInDocumentation();
}

export function ShowInDocumentation()
{
    return MetadataDecorators.ShowInDocumentation();
}
    

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


// #endregion




// #region DEPENDENCY INJECTION



import {Ctors} from './dependencyInjection/DependecyService';



export function Inject()
{
    return DependecyService.Injectable();
}

export function InjectOne<T, U>(constructorFunction: Ctors<T>, genericArgumentType? : Ctors<U>)
{
    return DependecyService.InjectOne(constructorFunction, genericArgumentType);
}

export function InjectGenericTypeArgument<T, U>(constructorFunction: Ctors<T>, genericArgumentType : Ctors<U>)
{
    return DependecyService.InjectGenericType(constructorFunction, genericArgumentType);
       
}

export function InjectForTypeArgument<T>(genericArgumentType : Ctors<T>)
{
    return function(target : Object, property : string | symbol) : void 
    {
        DependecyService.DefinePropertyAsInjectable(target.constructor as Ctors<any>, property.toString());
        OwnMetaDataContainer.Set(target.constructor, DependecyService["_injectableTypeKey"], property.toString(), {Type: Reflect.getMetadata("design:type", target, property), GenericType: genericArgumentType});
    }           
}


export function InjectAbstract<T>(cTor : Ctors<T>)
{
    return DependecyService.InjectOne(cTor);
}




// #endregion










// #region VALIDATIONS


export function Validate()
{
    return ControllersDecorators.Validate();
}

export function ValidateObject<T extends Object>(obj : T)
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

export function Rule<T extends Object, U extends keyof T>(action: (a : T[U]) => boolean, message?: string)
{
    return ValidationDecorators.Rule<T, U>(action, message);
}





// #endregion
