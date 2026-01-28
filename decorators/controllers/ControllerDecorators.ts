import { HTTPVerbs } from '../../enums/httpVerbs/HttpVerbs';
import IController from '../../interfaces/IController';
import IMidleware, { IRequestResultHandler } from '../../midlewares/IMidleware';
import FunctionAnalizer from '../../metadata/FunctionAnalizer';
import File from '../../files/File';
import DecoratorException from '../../exceptions/DecoratorException';
import ControllerLoadException from '../../exceptions/ControllerLoadException';
import path from 'path';
import OwnMetaDataContainer from '../../metadata/OwnMetaDataContainer';
import Exception from '../../exceptions/Exception';

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
    private static _fromPathParamsKeyMetadata = "meta:fromPathParamsKey";
    private static _ommitOnRouteNameKeyMetadata = "meta:ommitOnRouteKey";
    private static _controllerPathKeyMetadata = "meta:controllerPathKey";
    

    public static Route(route? : string)  
    {
        return function(target : Function)
        {
            let value = route ?? target.name.toLowerCase().replace("controller",""); 

             if(value && value.indexOf(' ') > 0)
                throw new ControllerLoadException(`You can not use empty spaces on actions of controllers. Change the action name of ${target.name}`);

            Reflect.defineMetadata(ControllersDecorators._routeKeyMetadata, value, target.prototype);
            
        }
    }

    public static GetControllerPathKey()
    {
        return this._controllerPathKeyMetadata;
    }
    public static GetRoute(ctor : Function) : string
    {
       let meta = Reflect.getMetadata(ControllersDecorators._routeKeyMetadata, ctor.prototype);

       let cName = ctor.name.toLowerCase().replace("controller", "");

       if(!meta)
            meta = cName;
        
        meta = meta.replace("[controller]", cName);

        if(meta.indexOf("[folder]") >= 0)
        {
            let metadata = OwnMetaDataContainer.Get(ctor, ControllersDecorators.GetControllerPathKey());

            if(!metadata)
                throw new Exception(`The controller type ${ctor.name} was not initialized yet`);

            let parts : string[] = [];

            let currentDir = path.dirname(metadata.Value!);
            let currentBase = path.basename(currentDir);
            while(currentBase && currentBase != "controllers")
            {
                parts.push(path.basename(currentBase));
                currentDir = path.normalize(currentDir.substring(0, currentDir.length - currentBase.length - 1));
                currentBase = path.basename(currentDir);
            }

            let fullPath= "";
            for(let part of parts.reverse())
            {
                fullPath += `/${part}`;
            }
            
             meta = meta.replace("[folder]", fullPath);
        }

       if(meta && meta[0].trim() != '/')
       {
            meta = `/${meta.trim()}`;
       }

       while(meta.indexOf("//") >= 0)
            meta = meta.replace("//", "/");

       return meta;

    }

    public static OmmitOnRoute()  
    {
        return function(target : Function)
        {
            Reflect.defineMetadata(ControllersDecorators._ommitOnRouteNameKeyMetadata, true, target.prototype);
        }
    }

    public static GetOmmitOnRoute(ctor : Function) : boolean
    {
       let meta = Reflect.getMetadata(ControllersDecorators._ommitOnRouteNameKeyMetadata, ctor.prototype);

       return !!meta;

    }

  
    public static Validate()  
    {
        return function(ctor : Function)
        {            
            Reflect.defineMetadata(ControllersDecorators._validateBodyKeyMetadata, true, ctor.prototype);            
        }
    }

    public static IsToValidate(ctor : Function) : boolean 
    {
       return Reflect.getMetadata(ControllersDecorators._validateBodyKeyMetadata, ctor.prototype) ?? false;
    }

    public static UseBefore(midleware : IMidleware)  
    {
        return function(ctor : Function)
        {
            let current : IMidleware[] = Reflect.getMetadata(ControllersDecorators._controllerMidlewaresKeyMetadata, ctor.prototype) ?? [];

            current.push(midleware);

            Reflect.defineMetadata(ControllersDecorators._controllerMidlewaresKeyMetadata, current, ctor.prototype);            
        }
    }

    public static UseAfter(resultHandler : IRequestResultHandler)  
    {
        return function(ctor : Function)
        {
            let current : IRequestResultHandler[] = Reflect.getMetadata(ControllersDecorators._controllerMidlewaresAfterKeyMetadata, ctor.prototype) ?? [];

            current.push(resultHandler);

            Reflect.defineMetadata(ControllersDecorators._controllerMidlewaresAfterKeyMetadata, current, ctor.prototype);            
        }
    }
    
   

    public static GetMidlewares(ctor : Function) : IMidleware[]
    {
       return Reflect.getMetadata(ControllersDecorators._controllerMidlewaresKeyMetadata, ctor.prototype) ?? [];
    }

    public static GetMidlewaresAfter(ctor : Function) : IRequestResultHandler[]
    {
       return Reflect.getMetadata(ControllersDecorators._controllerMidlewaresAfterKeyMetadata, ctor.prototype) ?? [];
    }


    public static RunBefore(midleware : IMidleware)  
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
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
            const prototype = typeof target == 'function' ? target.prototype : target;

            let current : IRequestResultHandler[] = Reflect.getMetadata(ControllersDecorators._controllerMidlewaresAfterKeyMetadata, prototype, methodName) ?? [];

            current.push(resultHandler);

            ControllersDecorators.SetMetaData(ControllersDecorators._controllerMidlewaresAfterKeyMetadata, prototype, methodName, current);
            
        }
    }
    

    public static GetBefores(ctor : Function, methodName : string) : IMidleware[]
    {
       return ControllersDecorators.GetMetaData<IMidleware[]>(ControllersDecorators._actionsMidlewaresKeyMetadata, ctor.prototype, methodName) ?? [];
    }


    public static GetAfters(ctor : Function, methodName : string) : IRequestResultHandler[]
    {
       return ControllersDecorators.GetMetaData<IRequestResultHandler[]>(ControllersDecorators._controllerMidlewaresAfterKeyMetadata, ctor.prototype, methodName) ?? [];
    } 

    public static Verb(verb : HTTPVerbs, actionName? : String )  
    {      

        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            const prototype = typeof target == 'function' ? target.prototype : target;

             if(actionName && actionName.indexOf(' ') > 0)
                throw new ControllerLoadException(`You can not use empty spaces on actions of controllers. Change the action name of ${prototype.constructor.name}.${methodName}`);

             

            if(!!!ControllersDecorators.GetMetaData<string>(ControllersDecorators._actionNameKeyMetadata, prototype, methodName))
                ControllersDecorators.SetMetaData(ControllersDecorators._actionNameKeyMetadata, prototype, methodName, actionName ?? methodName.toLowerCase());

            ControllersDecorators.SetMetaData(ControllersDecorators._actionVerbKeyMetadata, prototype, methodName, verb);
            
        }
    }
    
    public static GetVerb(ctor : Function, methodName : string ) : HTTPVerbs | undefined
    {
        let meta = ControllersDecorators.GetMetaData<HTTPVerbs>(ControllersDecorators._actionVerbKeyMetadata, ctor.prototype, methodName);

        return meta;
    }

     public static OmmitActionName()  
    {      

        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
            const prototype = typeof target == 'function' ? target.prototype : target;

            ControllersDecorators.SetMetaData(ControllersDecorators._ommitOnRouteNameKeyMetadata, prototype, methodName, true);
            
        }
    }
    
    public static GetOmmitActionName(ctor : Function, methodName : string ) : boolean
    {
        let meta = !!ControllersDecorators.GetMetaData<boolean>(ControllersDecorators._ommitOnRouteNameKeyMetadata, ctor.prototype, methodName);

        return meta;
    }

    

    public static Action(actionName? : String)  
    {
        return function( target : Object, methodName : string, propertyDescriptor : PropertyDescriptor)
        {
             const prototype = typeof target == 'function' ? target.prototype : target;

            if(actionName && actionName.indexOf(' ') > 0)
                throw new ControllerLoadException(`You can not use empty spaces on actions of controllers. Change the action name of ${prototype.constructor.name}.${methodName}`);
          
          

            ControllersDecorators.SetMetaData(ControllersDecorators._actionNameKeyMetadata, prototype, methodName, actionName ?? methodName.toLowerCase());
            
        }
    }

    public static GetAction(ctor : Function, methodName : string ) : string | undefined
    {
        let meta = ControllersDecorators.GetMetaData<string>(ControllersDecorators._actionNameKeyMetadata, ctor.prototype, methodName);

        if(meta && meta[0].trim() != '/')
        {  
            return `/${meta.trim()}`;
        }

        return meta;
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

    public static GetFromBodyArgs(ctor : Function, method : string) : {Index : number, Field? : string, Type : Function, Required : boolean }[]
    {
        return Reflect.getMetadata(ControllersDecorators._fromBodyKeyMetadata, ctor.prototype, method) ?? [];
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
    

    public static GetFromFilesArgs(ctor : Function, method : string) : IMethodFileParam[]
    {
        let params : IMethodFileParam[] = Reflect.getMetadata(ControllersDecorators._fromFilesKeyMetadata, ctor.prototype, method) ?? [];

        return params.sort((a, b) => a.Index-b.Index);
        
    }

    public static MaxFilesSize(bytes : number)  
    {
        return function(target : Object)
        {            
            const prototype = typeof target == 'function' ? target.prototype : target;

            Reflect.defineMetadata(ControllersDecorators._maxFilesSizeKeyMetadata, bytes, prototype);            
        }
    }

    public static GetMaxFilesSize(ctor : Function) : number 
    {
       return Reflect.getMetadata(ControllersDecorators._maxFilesSizeKeyMetadata, ctor.prototype) ?? 0;
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
   
    public static GetFromQueryArgs(ctor : Function, method : string) :  IMethodParam[]
    {
         let params : IMethodParam[] = Reflect.getMetadata(ControllersDecorators._fromQueryKeyMetadata, ctor.prototype, method) ?? [];

         return params.sort((a, b) => a.Index-b.Index);
    }

    public static FromPath(argName? : string, required? : boolean)
    {
        return function( target : Object, methodName: string , parameterIndex: number)
        {
            const constructor = typeof target == 'function' ? target : target.constructor;

            const prototype = typeof target == 'function' ? target.prototype : target;

            let meta = ControllersDecorators.GetFromPathArgs(constructor, methodName); 

            let params = FunctionAnalizer.ExtractParamsList(prototype, (prototype as any)[methodName]);

            let thisParam = params.filter(s => s.Index == parameterIndex)[0];

            let item = meta.filter(x => x.Index == parameterIndex);

            if(item.length == 0)
                meta.push({Index : parameterIndex, Field : argName ?? thisParam.Name, Type : thisParam.Type, Required : required ?? true});
            
            else {

                item[0].Field = argName ?? thisParam.Name;
                item[0].Type = thisParam.Type;
            }

            Reflect.defineMetadata(ControllersDecorators._fromPathParamsKeyMetadata, meta, prototype, methodName);             
        }
    }
   
    public static GetFromPathArgs(ctor : Function, method : string) : IMethodParam[]
    {       
        let params : IMethodParam[] = Reflect.getMetadata(ControllersDecorators._fromPathParamsKeyMetadata, ctor.prototype, method) ?? [];

        return params.sort((a, b) => a.Index-b.Index);
    }

    
    public static GetNonDecoratedArguments(
        ctor: Function, method: Symbol | string, 
         fromBody: ReturnType<typeof ControllersDecorators.GetFromBodyArgs>, 
         fromQuery: ReturnType<typeof ControllersDecorators.GetFromQueryArgs>, 
         fromPath: ReturnType<typeof ControllersDecorators.GetFromPathArgs>,
         fromFiles: ReturnType<typeof ControllersDecorators.GetFromFilesArgs>) : void
    {
        let ts = (
            Reflect.getMetadata("design:paramtypes", ctor, method.toString()) ??
            Reflect.getMetadata("design:paramtypes", ctor.prototype, method.toString())
        ) as Function[];     

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

            if(fromQuery.filter(s => s.Index == i).length == 0 && fromPath.filter(s => s.Index == i).length == 0)
            {
                if([Date, String, Number, Boolean].filter(t => t == e).length > 0)
                {
                    try{

                        let paramName = '';
                        if((ctor.prototype as any)[method.toString()].name != '')
                        {
                            let funcParameters = FunctionAnalizer.ExtractParamsList(ctor.prototype, (ctor.prototype as any)[method.toString()]);
                            
                            let thisParameter = funcParameters.filter(p => p.Index == i);

                            if(thisParameter.length > 0)
                                paramName = thisParameter[0].Name;
                        }
                        else
                        {
                            let funcParameters = FunctionAnalizer.GetParametersNames(ctor.toString(), method.toString());

                            let currentPrototype = (ctor as any).prototype;
                            while(currentPrototype && funcParameters.length == 0)
                            {
                                if(funcParameters.length == 0)
                                    funcParameters = FunctionAnalizer.GetParametersNames(currentPrototype.constructor.toString(), method.toString());

                                currentPrototype = (currentPrototype as any).__proto__;
                            }
                            

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


export interface IMethodParam
{   
    Index : number; 
    Field : string;
    Type : Function; 
    Required : boolean; 
}

export interface IMethodFileParam
{
    Index : number;
    FileName? : string; 
    Required: boolean; 
}