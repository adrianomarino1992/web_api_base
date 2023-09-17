import 'reflect-metadata';
import IDIContext from './IDIContext';
import Exception from '../exceptions/Exception';
import FindDependencyException from '../exceptions/FindDependencyException';

export default class DependecyService
{
    private static _services : IService[] = [];

    private static _injectableKey : string = "di:injectable"; 
    private static _injectableTypeKey : string = "di:injectable-type"; 

    public static RegisterFor(type : Function, ctor : { new (...args : any[]) : any;}, scope? :  DIEscope, builder? : () => any) : void    
    {        
        let defaultBuilder = DependecyService.DefaultObjectBuilder(type, ctor);

        let exist = this._services.find(s => s.Type == type);

        if(exist === undefined)
            this._services.push({ Type : type, Builder : builder ?? defaultBuilder, Scope : scope ?? DIEscope.TRANSIENT });
        else{
            exist.Scope = scope ?? exist.Scope;
            exist.Builder =  builder ?? defaultBuilder;
        }
              
    }


    public static Register(type : Function, scope? : DIEscope, builder? : () => any) : void
    {       
        let defaultBuilder = DependecyService.DefaultObjectBuilder(type);

        let exist = this._services.find(s => s.Type == type);

        if(exist === undefined)
            this._services.push({ Type : type, Builder : builder ?? defaultBuilder, Scope : scope ?? DIEscope.TRANSIENT });
        else{            
            exist.Scope = scope ?? exist.Scope;
            exist.Builder =  builder ?? defaultBuilder;
        }
    }

    private static DefaultObjectBuilder(type : Function, ctor? : { new (...args : any[]) : any;}) : ()=>any
    {
        return function(context? : IDIContext){

            let service = DependecyService._services.find(u => u.Type == type);

            if(context && context.Intances && service?.Scope == DIEscope.SCOPED)
            {
                let scopped = context.Intances.filter(s => s.Type == type);

                if(scopped.length > 0 && scopped[0].Object)
                {
                    return scopped[0].Object;
                }                            
            }
            
            let insance = Reflect.construct(ctor ?? type, []);
            DependecyService.CheckForDependenciesAndResolve(insance, context ?? DependecyService.IsDIConext(insance) ? insance : undefined);
            return insance;
        }
    }
    
    public static Resolve<T>(type :  Function, context? : IDIContext) : T | undefined
    {
        let service = this._services.find(u => u.Type == type);

        if(!service)
            return undefined;
        
        let insance = service.Builder(context) as T;

        if(service.Scope == DIEscope.SINGLETON)
        {
            service.Builder = () => insance;
        }

        return insance
    }

    public static ResolveCtor(ctor :  Function, context? : IDIContext) : any | undefined
    {

        let service = this._services.find(u => u.Type == ctor);

        if(!service)
            return undefined;
        
        let insance = service.Builder(context);

        if(service.Scope == DIEscope.SINGLETON)
        {
            service.Builder = () => insance;
        }

        return insance
    }

    public static Injectable() : (target : Object, property : string | symbol) => void 
    {
        return function(target : Object, property : string | symbol) : void 
        {
            Reflect.defineMetadata(DependecyService._injectableKey, true, target.constructor, property)
        }
    }

    public static IsInjectable(target : object, property : string) : boolean
    {
        let marked = Reflect.getMetadata(DependecyService._injectableKey, target, property) ?? false;
        let type = Reflect.getMetadata(DependecyService._injectableTypeKey, target, property) != undefined; 

        return marked || type;
    }

    public static InjectOne(cTor : Function) : (target : Object, property : string | symbol) => void 
    {
        return function(target : Object, property : string | symbol) : void 
        {
            Reflect.defineMetadata(DependecyService._injectableTypeKey, cTor, target.constructor, property)
        }
    }

    public static GetDIType(target : object, property : string) :  {new (...args:any[]) : unknown} | undefined
    {
        let type = Reflect.getMetadata(DependecyService._injectableTypeKey, target.constructor, property);

        if(!type)
            type = Reflect.getMetadata("design:type", target, property);

        return type;
    }

   
    public static CheckForDependenciesAndResolve(object : any, context? : IDIContext)
    {
        for(let k of Object.keys(object))
        {
            if(object[k] != 'function')
            {
                if(DependecyService.IsInjectable(object.constructor, k))
                {
                    let tp = DependecyService.GetDIType(object, k);

                    if(tp == undefined)
                        throw new FindDependencyException(`Can not resolve the dependecy of ${object.constructor.name}.${k}`);

                    let service = this._services.find(u => u.Type == tp);

                    if(context && context.Intances && service?.Scope == DIEscope.SCOPED)
                    {
                        let scopped = context.Intances.filter(s => s.Type == tp);

                        if(scopped.length > 0 && scopped[0]){
                            object[k] = scopped[0].Object;
                            continue;
                        }                            
                    }
                        
                    let instance = DependecyService.Resolve(tp);                    

                    if(instance == undefined)
                        throw new FindDependencyException(`Can not resolve the dependecy of ${object.constructor.name}.${k}`);                   
                   

                    if(DependecyService.IsDIConext(object) && service?.Scope == DIEscope.SCOPED)
                    {
                        if(!object.Intances)
                            object.Intances = [];

                        object.Intances.push(
                            {
                                Object : instance, 
                                Type : tp
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
interface IService
{
    Type : Function;
    Builder : Function;
    Scope : DIEscope
}



