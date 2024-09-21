import 'reflect-metadata';
import IDIContext from './IDIContext';
import Exception from '../exceptions/Exception';
import FindDependencyException from '../exceptions/FindDependencyException';
import OwnMetaDataContainer, { IMetaData } from '../metadata/OwnMetaDataContainer';
import RegisterDependencyException from '../exceptions/RegisterDependencyException';

export default class DependecyService
{
    private static _services : IService[] = [];

    private static _injectableTypeKey : string = "di:injectable-type"; 
    private static _injectablePropertiesTypeKey : string = "di:injectable-properties"; 

    public static DefinePropertyAsInjectable(ctor: Function, property : string)
    {
        let meta = DependecyService.GetInjectablesProperties(ctor);

        let index = meta.findIndex(d => d == property);

        if(index == -1)
            meta.push(property);     

        OwnMetaDataContainer.Set(ctor, DependecyService._injectablePropertiesTypeKey, undefined, meta);

    }

    public static GetInjectablesProperties(ctor: Function) : string[]
    {
        let meta = OwnMetaDataContainer.Get(ctor, DependecyService._injectablePropertiesTypeKey);

        if(!meta)
            return [];

        return meta.Value;
    }
    
    public static Inject()
    {
        return DependecyService.Injectable();
    }

    public static Injectable() : (target : Object, property : string | symbol) => void 
    {
        return function(target : Object, property : string | symbol) : void 
        {
            DependecyService.DefinePropertyAsInjectable(target.constructor, property.toString());
            OwnMetaDataContainer.Set(target.constructor, DependecyService._injectableTypeKey, property.toString(), 
            {
                Type: Reflect.getMetadata("design:type", target, property)

            } as IRegister);
        }
    }

    public static IsInjectable(target : object, property : string) : boolean
    {
        let type = OwnMetaDataContainer.Get(target, DependecyService._injectableTypeKey, property) != undefined; 

        return type;
    }

    public static InjectOne(cTor : Function, genericType? :  Function) : (target : Object, property : string | symbol) => void 
    {
        return function(target : Object, property : string | symbol) : void 
        {
            DependecyService.DefinePropertyAsInjectable(target.constructor, property.toString());
            OwnMetaDataContainer.Set(target.constructor, DependecyService._injectableTypeKey, property.toString(), {Type: cTor, GenericType: genericType} as IRegister)
            
        }
    }

    public static InjectGenericType(ctor: Function, genericType :  Function) : (target : Object, property : string | symbol) => void 
    {
        return DependecyService.InjectOne(ctor, genericType);       
    }

    public static GetDIType(target : object, property : string) :  IRegister | undefined
    {
        let meta = OwnMetaDataContainer.Get(target.constructor, DependecyService._injectableTypeKey, property);

        if(meta)
            return meta.Value;

        return { Type: Reflect.getMetadata("design:type", target, property)};
    }


    public static RegisterFor(type : Function, ctor : new (...args : any[]) => any, scope? :  DIEscope, builder? : () => any) : void    
    {        
        let defaultBuilder = DependecyService.DefaultObjectBuilder(type, ctor);

        let exist = this._services.find(s => s.Type == type && !s.GenericType);

       if(exist === undefined)
        {
            this._services.push
            (
                { 
                    Type : type, 
                    Builder : builder ? (c?: IDIContext, e? : Function) => builder() : (c?: IDIContext, e? : Function) => defaultBuilder(c, e), 
                    Scope : scope ?? DIEscope.TRANSIENT 
                }
            );
               
        }else{
            exist.Scope = scope ?? exist.Scope;
            exist.Builder =  builder ? (c?: IDIContext, e? : Function) => builder() : (c?: IDIContext, e? : Function) => defaultBuilder(c, e);
        }
              
    }


    public static Register(type : Function, scope? : DIEscope, builder? : () => any) : void
    {       
        let defaultBuilder = DependecyService.DefaultObjectBuilder(type);

        let exist = this._services.find(s => s.Type == type && !s.GenericType);


        if(exist === undefined)
        {
            this._services.push
            (
                { 
                    Type : type, 
                    Builder : builder ? (c?: IDIContext, e? : Function) => builder() : (c?: IDIContext, e? : Function) => defaultBuilder(c, e), 
                    Scope : scope ?? DIEscope.TRANSIENT 
                }
            );
               
        }
        else{            
            exist.Scope = scope ?? exist.Scope;
            exist.Builder =  builder ? (c?: IDIContext, e? : Function) => builder() : (c?: IDIContext, e? : Function) => defaultBuilder(c, e);
        }
    }

    public static RegisterGeneric(type : Function,  genericType?: Function, ctor? : new (...args : any[]) => any, scope? : DIEscope, builder? : (genericTypeFunction? : Function) => any) : void
    {
        if(!ctor && !builder)
            throw new RegisterDependencyException(`Can not register a generic depency with not provide a concrete constructor or builder function`);

        let defaultBuilder = DependecyService.DefaultObjectBuilder(type, ctor);

        let exist = this._services.find(s => s.Type == type && (!s.GenericType || s.GenericType == genericType));

        if(exist === undefined)
        {
            this._services.push
            (
                { 
                    Type : type, 
                    Builder : builder ? (c?: IDIContext, e? : Function) => builder(e) : (c?: IDIContext, e? : Function) => defaultBuilder(c, e), 
                    Scope : scope ?? DIEscope.TRANSIENT 
                }
            );
                   
        }
        else{
            exist.Scope = scope ?? exist.Scope;
            exist.Builder =  builder ? (c?: IDIContext, e? : Function) => builder() : (c?: IDIContext, e? : Function) => defaultBuilder(c, e);
        }
    }
    

    private static DefaultObjectBuilder(type : Function, ctor? :  new (...args : any[]) => any) : (context? : IDIContext, genericType?: Function)=>any
    {
        return function(context? : IDIContext, genericType?: Function){

            let service = DependecyService._services.find(u => u.Type == type && (!u.GenericType || u.GenericType == genericType));

            if(context && context.Intances && service?.Scope == DIEscope.SCOPED)
            {
                let scopped = context.Intances.filter(s => s.Type == type && (!s.GenericType || s.GenericType == genericType));

                if(scopped.length > 0 && scopped[0].Object)
                {
                    return scopped[0].Object;
                }                        
                
            }
            
            let instance = Reflect.construct(ctor ?? type, []);
            DependecyService.CheckForDependenciesAndResolve(instance, context ?? DependecyService.IsDIConext(instance) ? instance : undefined);

            if(context && context.Intances && service?.Scope == DIEscope.SCOPED)
            {      
                context.Intances.push(
                {
                    Object: instance, 
                    Type: type, 
                    GenericType : genericType
                });
            }

            return instance;
        }
    }

    public static ResolveGeneric<T>(type :  Function, genericType? :  Function, context? : IDIContext) : T | undefined
    {
        let service = this._services.find(u => u.Type == type && (!u.GenericType || u.GenericType == genericType));

        if(!service)
            return undefined;
        
        let instance = service.Builder(context, genericType) as T;

        if(service.Scope == DIEscope.SINGLETON)
        {
            service.Builder = (e, s) => instance;
        }

        if(context && context.Intances && service?.Scope == DIEscope.SCOPED)
        {
            let scopped = context.Intances.filter(s => s.Type == type && (!s.GenericType || s.GenericType == genericType));

            if(scopped.length > 0 && scopped[0].Object)
            {
                return scopped[0].Object;
            }     
            
            context.Intances.push(
            {
                Object: instance, 
                Type: type, 
                GenericType : genericType
            });
        }
                      
        DependecyService.CheckForDependenciesAndResolve(instance, context ?? DependecyService.IsDIConext(instance as any) ? instance as IDIContext : undefined);            

        return instance;
    }
    
    public static Resolve<T>(type :  Function, context? : IDIContext) : T | undefined
    {
        return DependecyService.ResolveGeneric<T>(type, undefined, context);
    }

    
    public static ResolveCtor(ctor :  Function, context? : IDIContext) : any | undefined
    {
        return DependecyService.ResolveGeneric(ctor, undefined, context);
    }

   
    public static CheckForDependenciesAndResolve(object : any, context? : IDIContext)
    {
        let keys = Object.keys(object);
        keys.push(...DependecyService.GetInjectablesProperties(object.constructor));
        for(let k of keys)
        {
            if(object[k] != 'function')
            {
                if(DependecyService.IsInjectable(object.constructor, k))
                {
                    let tp = DependecyService.GetDIType(object, k);

                    if(!tp)
                        throw new FindDependencyException(`Can not resolve the dependecy of ${object.constructor.name}.${k}`);

                    let service = this._services.find(u => u.Type == tp!.Type && (!u.GenericType || u.GenericType == tp!.GenericType));

                    if(context && context.Intances && service?.Scope == DIEscope.SCOPED)
                    {
                        let scopped = context.Intances.filter(s => s.Type == tp!.Type && (!s.GenericType || s.GenericType == tp!.GenericType));

                        if(scopped.length > 0 && scopped[0]){
                            object[k] = scopped[0].Object;
                            continue;
                        }                            
                    }
                        
                    let instance = tp.GenericType ? DependecyService.ResolveGeneric(tp.Type, tp.GenericType) : DependecyService.Resolve(tp.Type);                    

                    if(instance == undefined)
                        throw new FindDependencyException(`Can not resolve the dependecy of ${object.constructor.name}.${k}`);                   
                   

                    if(DependecyService.IsDIConext(object) && service?.Scope == DIEscope.SCOPED)
                    {
                        if(!object.Intances)
                            object.Intances = [];

                        object.Intances.push(
                            {
                                Object : instance, 
                                Type : tp.Type, 
                                GenericType: tp.GenericType
                            });
                    }

                    object[k] = instance;
                }
            }
        }
    }
    

    public static Build<T extends Function>(Ctor : T)
    {
        let object = Reflect.construct(Ctor, []);

        this.CheckForDependenciesAndResolve(object);

        return object as T;
    }

    private static IsDIConext(object : any) : object is IDIContext
    {
        return "Intances" in object;
    }
    
    
}

export enum DIEscope
{
    SCOPED, 
    TRANSIENT, 
    SINGLETON
}

interface IRegister
{
    Type: Function, 
    GenericType?: Function
}

interface IService
{
    Type : Function;
    GenericType? : Function;
    Builder : (context? : IDIContext, GenericType?: Function) => any;
    Scope : DIEscope
}



