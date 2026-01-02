import { HTTPVerbs } from '../../enums/httpVerbs/HttpVerbs';
import IController from '../../interfaces/IController';
import IMidleware, { IRequestResultHandler } from '../../midlewares/IMidleware';
import FunctionAnalizer from '../../metadata/FunctionAnalizer';
import File from '../../files/File';
import DecoratorException from '../../exceptions/DecoratorException';

export default class ControllersDecorators
{
    constructor(){}

    private static _routeKeyMetadata = "meta:controllerRoute";
    private static _actionVerbKeyMetadata = "meta:actionVerb";
    private static _actionNameKeyMetadata = "meta:actionName";    
    private static _controllerMidlewaresKeyMetadata = "meta:controllerMidlewaresKey";
    private static _actionsMidlewaresKeyMetadata = "meta:actionMidlewaresKey";
    private static _validateBodyKeyMetadata = "meta:validateBodyKey";
    private static _fromQueryKeyMetadata = "meta:fromQueryKey";
    private static _fromBodyKeyMetadata = "meta:fromBodyKey";
    private static _fromFilesKeyMetadata = "meta:fromFilesKey";
    private static _maxFilesSizeKeyMetadata = "meta:maxFilesSizeKey";
    private static _controllerMidlewaresAfterKeyMetadata = "meta:controllerMidlewaresAfterKey";  
    

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

       let cName = controller.constructor.name.toLocaleLowerCase().replace("controller", "");

       if(!meta)
            meta = cName;
        
        meta = meta.toLocaleLowerCase().replace("[controller]", cName);

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

    public static UseBefore(midleware : IMidleware)  
    {
        return function( target : Function)
        {
            let current : IMidleware[] = Reflect.getMetadata(ControllersDecorators._controllerMidlewaresKeyMetadata, target) ?? [];

            current.push(midleware);

            Reflect.defineMetadata(ControllersDecorators._controllerMidlewaresKeyMetadata, current, target);            
        }
    }

    public static UseAfter(resultHandler : IRequestResultHandler)  
    {
        return function( target : Function)
        {
            let current : IRequestResultHandler[] = Reflect.getMetadata(ControllersDecorators._controllerMidlewaresAfterKeyMetadata, target) ?? [];

            current.push(resultHandler);

            Reflect.defineMetadata(ControllersDecorators._controllerMidlewaresAfterKeyMetadata, current, target);            
        }
    }
    
   

    public static GetMidlewares(controller : IController) : IMidleware[]
    {
       return Reflect.getMetadata(ControllersDecorators._controllerMidlewaresKeyMetadata, controller.constructor) ?? [];
    }

    public static GetMidlewaresAfter(controller : IController) : IRequestResultHandler[]
    {
       return Reflect.getMetadata(ControllersDecorators._controllerMidlewaresAfterKeyMetadata, controller.constructor) ?? [];
    }


    public static RunBefore(midleware : IMidleware)  
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            const constructor = typeof target == 'function' ? target : target.constructor;

            const prototype = typeof target == 'function' ? target.prototype : target;

            let current : IMidleware[] = Reflect.getMetadata(ControllersDecorators._actionsMidlewaresKeyMetadata, prototype, methodName) ?? [];

            current.push(midleware);

            ControllersDecorators.SetMetaData(ControllersDecorators._actionsMidlewaresKeyMetadata, prototype, methodName, current);
            
        }
    }


    public static RunAfter(resultHandler : IRequestResultHandler)  
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            const constructor = typeof target == 'function' ? target : target.constructor;

            let current : IRequestResultHandler[] = Reflect.getMetadata(ControllersDecorators._controllerMidlewaresAfterKeyMetadata, constructor, methodName) ?? [];

            current.push(resultHandler);

            ControllersDecorators.SetMetaData(ControllersDecorators._controllerMidlewaresAfterKeyMetadata, constructor, methodName, current);
            
        }
    }
    

    public static GetBefores(controller : IController, methodName : string) : IMidleware[]
    {
       return ControllersDecorators.GetMetaData<IMidleware[]>(ControllersDecorators._actionsMidlewaresKeyMetadata, controller, methodName) ?? [];
    }


    public static GetAfters(controller : IController, methodName : string) : IRequestResultHandler[]
    {
       return ControllersDecorators.GetMetaData<IRequestResultHandler[]>(ControllersDecorators._controllerMidlewaresAfterKeyMetadata, controller, methodName) ?? [];
    } 

    public static Verb(verb : HTTPVerbs, actionName? : String )  
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            const constructor = typeof target == 'function' ? target : target.constructor;

            if(!!!ControllersDecorators.GetMetaData<string>(ControllersDecorators._actionNameKeyMetadata, constructor, methodName))
                ControllersDecorators.SetMetaData(ControllersDecorators._actionNameKeyMetadata, constructor, methodName, actionName ?? methodName.toLocaleLowerCase());

            ControllersDecorators.SetMetaData(ControllersDecorators._actionVerbKeyMetadata, constructor, methodName, verb);
            
        }
    }
    
    public static GetVerb(target : IController, methodName : string ) : HTTPVerbs | undefined
    {
        let meta = ControllersDecorators.GetMetaData<HTTPVerbs>(ControllersDecorators._actionVerbKeyMetadata, target.constructor, methodName);

        return meta;
    }

    public static Action(actionName? : String)  
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            const constructor = typeof target == 'function' ? target : target.constructor;

            ControllersDecorators.SetMetaData(ControllersDecorators._actionNameKeyMetadata, constructor, methodName, actionName ?? methodName.toLowerCase());
            
        }
    }

    public static GetAction(target : IController, methodName : string ) : string | undefined
    {
        let meta = ControllersDecorators.GetMetaData<string>(ControllersDecorators._actionNameKeyMetadata, target.constructor, methodName);

        if(meta && meta[0] != '/')
        {  
            return `/${meta}`.toLowerCase();
        }

        return meta?.toLowerCase();
    }

    public static RequiredFromBodyArg(bodyPropName? : string) 
    {
        return ControllersDecorators.FromBody(bodyPropName, true);
    }

    public static OptionalFromBodyArg(bodyPropName? : string) 
    {
        return ControllersDecorators.FromBody(bodyPropName, false);
    }

    public static FromBody(bodyPropName? : string, required? : boolean)
    {
        return function( target : Object, methodName: string , parameterIndex: number)
        {
            const constructor = typeof target == 'function' ? target : target.constructor;

            const prototype = typeof target == 'function' ? target.prototype : target;

            let meta = ControllersDecorators.GetFromBodyArgs(constructor, methodName);

            let params = FunctionAnalizer.ExtractParamsList(prototype, (prototype as any)[methodName]);

            let item = meta.filter(x => x.Index == parameterIndex);

            let thisParam = params.filter(s => s.Index == parameterIndex)[0];            

            if(item.length == 0)
                meta.push({Index : parameterIndex, Field : bodyPropName, Type : thisParam.Type, Required : required ?? true});
            
            else {

                item[0].Field = bodyPropName;
                item[0].Type = thisParam.Type;
            }

            Reflect.defineMetadata(ControllersDecorators._fromBodyKeyMetadata, meta, prototype, methodName);            
        }
    }

    public static GetFromBodyArgs(target : Function, method : string) : {Index : number, Field? : string, Type : Function, Required : boolean }[]
    {
        const prototype = typeof target == 'function' ? target.prototype : target;

        return Reflect.getMetadata(ControllersDecorators._fromBodyKeyMetadata, prototype, method) ?? [];
    }

    public static OptionalFromFilesArg(fileName? : string, maxFileSizeMB? : number) 
    {
        return ControllersDecorators.FromFiles(fileName, false);
    }

    public static RequiredFromFilesArg(fileName? : string) 
    {
        return ControllersDecorators.FromFiles(fileName, true);
    }

    public static FromFiles(fileName? : string, required? : boolean)
    {
        return function( target : Object, methodName: string , parameterIndex: number)
        {
            const constructor = typeof target == 'function' ? target : target.constructor;

            const prototype = typeof target == 'function' ? target.prototype : target;

            let meta = ControllersDecorators.GetFromFilesArgs(constructor, methodName);            

            let params = FunctionAnalizer.ExtractParamsList(prototype, (prototype as any)[methodName]);

            let item = meta.filter(x => x.Index == parameterIndex);

            let thisParam = params.filter(s => s.Index == parameterIndex)[0]; 
            
            if(thisParam.Type != File)
                throw new DecoratorException('FromFiles decorator must be used in a web_api_base File type parameter');

            if(item.length == 0)
                meta.push({Index : parameterIndex, FileName : fileName,  Required : required ?? true});
            
            else {
                item[0].FileName = fileName;                
            }

            Reflect.defineMetadata(ControllersDecorators._fromFilesKeyMetadata, meta, prototype, methodName);            
        }
    }
    

    public static GetFromFilesArgs(target : Function, method : string) : {Index : number, FileName? : string, Required: boolean }[]
    {
        const prototype = typeof target == 'function' ? target.prototype : target;

        return Reflect.getMetadata(ControllersDecorators._fromFilesKeyMetadata, prototype, method) ?? [];
    }

    public static MaxFilesSize(bytes : number)  
    {
        return function(target : Function)
        {            
            const prototype = typeof target == 'function' ? target.prototype : target;

            Reflect.defineMetadata(ControllersDecorators._maxFilesSizeKeyMetadata, bytes, prototype);            
        }
    }

    public static GetMaxFilesSize<T extends IController>(target : new (...args: any) => T) : number 
    {
        const prototype = typeof target == 'function' ? target.prototype : target;

       return Reflect.getMetadata(ControllersDecorators._maxFilesSizeKeyMetadata, prototype) ?? 0;
    }


    public static RequiredFromQueryArg(bodyPropName? : string) 
    {
        return ControllersDecorators.FromQuery(bodyPropName, true);
    }

    public static OptionalFromQueryArg(bodyPropName? : string) 
    {
        return ControllersDecorators.FromQuery(bodyPropName, false);
    }

    public static FromQuery(bodyPropName? : string, required? : boolean)
    {
        return function( target : Object, methodName: string , parameterIndex: number)
        {
            const constructor = typeof target == 'function' ? target : target.constructor;

            const prototype = typeof target == 'function' ? target.prototype : target;

            let meta = ControllersDecorators.GetFromQueryArgs(constructor, methodName); 

            let params = FunctionAnalizer.ExtractParamsList(prototype, (prototype as any)[methodName]);

            let thisParam = params.filter(s => s.Index == parameterIndex)[0];

            let item = meta.filter(x => x.Index == parameterIndex);

            if(item.length == 0)
                meta.push({Index : parameterIndex, Field : bodyPropName ?? thisParam.Name, Type : thisParam.Type, Required : required ?? true});
            
            else {

                item[0].Field = bodyPropName ?? thisParam.Name;
                item[0].Type = thisParam.Type;
            }

            Reflect.defineMetadata(ControllersDecorators._fromQueryKeyMetadata, meta, prototype, methodName);             
        }
    }
   
    public static GetFromQueryArgs(target : Function, method : string) :  {Index : number, Field : string, Type : Function, Required : boolean }[]
    {
        const prototype = typeof target == 'function' ? target.prototype : target;

        return Reflect.getMetadata(ControllersDecorators._fromQueryKeyMetadata, prototype, method) ?? [];
    }

    
    public static GetNonDecoratedArguments(
        empty: IController, method: Symbol | string, 
         fromBody: ReturnType<typeof ControllersDecorators.GetFromBodyArgs>, 
         fromQuery: ReturnType<typeof ControllersDecorators.GetFromQueryArgs>, 
         fromFiles: ReturnType<typeof ControllersDecorators.GetFromFilesArgs>) : void
    {
        let ts = ((Reflect.getMetadata("design:paramtypes", empty, method.toString()) ??
        Reflect.getMetadata("design:paramtypes", empty.constructor, method.toString())) ?? []) as Function[];     

        ts.forEach((e, i) => 
        {
            if(fromBody.filter(s => s.Index == i).length == 0)
            {
                if([Date, String, Number, Boolean, File].filter(t => t == e).length == 0)
                    fromBody.push({Index : i, Type: e, Required : true});
            }   
            
            if(fromFiles.filter(s => s.Index == i).length == 0)
            {
                if(e == File)
                    fromFiles.push({Index : i, Required : true});
            }   

            if(fromQuery.filter(s => s.Index == i).length == 0)
            {
                if([Date, String, Number, Boolean].filter(t => t == e).length > 0)
                {
                    try{

                        let paramName = '';
                        if((empty as any)[method.toString()].name != '')
                        {
                            let funcParameters = FunctionAnalizer.ExtractParamsList(empty.constructor.prototype, (empty.constructor.prototype as any)[method.toString()]);
                            
                            let thisParameter = funcParameters.filter(p => p.Index == i);

                            if(thisParameter.length > 0)
                                paramName = thisParameter[0].Name;
                        }
                        else
                        {
                            let funcParameters = FunctionAnalizer.GetParametersNames(empty.constructor.toString(), method.toString());

                            if(funcParameters.length == 0 && (empty as any).__proto__.__proto__ != undefined)
                                funcParameters = FunctionAnalizer.GetParametersNames((empty as any).__proto__.__proto__.constructor.toString(), method.toString());

                            if(funcParameters.length > i)
                                paramName =  funcParameters[i];
 
                        }
                        
                        fromQuery.push({Field: paramName, Index: i, Required : true, Type : e});

                    }catch{

                        fromQuery.push({Field: "", Index: i, Required : true, Type : e});
                    }
                }
            } 
        });
    }
    
    private static SetMetaData<T>(key: string, target : Object, methodName : string, value : T)
    {
            const prototype = typeof target == 'function' ? target.prototype : target;             
            
            Reflect.defineMetadata(key, value, prototype, methodName);
    }


    private static GetMetaData<T>(key: string, target : Object, methodName : string) : T | undefined
    {
        const prototype = typeof target == 'function' ? target.prototype : target; 

        var meta = Reflect.getMetadata(key, prototype, methodName);
    
        if(meta != undefined)
            return meta as T;
        else 
            return undefined;
    }    

}


