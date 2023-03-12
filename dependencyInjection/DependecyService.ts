import 'reflect-metadata';

export default class DependecyService
{
    private static _services : IService[] = [];

    private static _injectableKey : string = "di:injectable"; 
    private static _injectableTypeKey : string = "di:injectable-type"; 

    public static RegisterFor(type : Function, ctor : { new (...args : any[]) : any;}, builder? : () => any) : void    
    {        
        let defaultBuilder = () =>  Reflect.construct(ctor ?? type, []) as any;

        let exist = this._services.find(s => s.Type == type);

        if(exist === undefined)
            this._services.push({ Type : type, Builder : builder ?? defaultBuilder });
        else
            exist.Builder =  builder ?? defaultBuilder;
              
    }


    public static Register(type : Function, builder? : () => any) : void
    {
        let defaultBuilder = () => Reflect.construct(type, []);

        let exist = this._services.find(s => s.Type == type);

        if(exist === undefined)
            this._services.push({ Type : type, Builder : builder ?? defaultBuilder });
        else
            exist.Builder =  builder ?? defaultBuilder;
    }
    
    public static Resolve<T>(type : Function, args? : any[]) : T
    {
        return this._services.find(u => u.Type == type)?.Builder(args) as T;
    }

    public static ResolveCtor(ctor : Function, args? : any[]) : any
    {
        return this._services.find(u => u.Type == ctor)?.Builder(args);
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

    public static InjectOne(tp : Function) : (target : Object, property : string | symbol) => void 
    {
        return function(target : Object, property : string | symbol) : void 
        {
            Reflect.defineMetadata(DependecyService._injectableTypeKey, tp, target.constructor, property)
        }
    }

    public static GetDIType(target : object, property : string) 
    {
        let type = Reflect.getMetadata(DependecyService._injectableTypeKey, target.constructor, property);

        if(!type)
            type = Reflect.getMetadata("design:type", target, property);

        return type;
    }

   
    public static CheckForDependenciesAndResolve(object : any)
    {
        for(let k of Object.keys(object))
        {
            if(object[k] != 'function')
            {
                if(DependecyService.IsInjectable(object.constructor, k))
                {
                    let tp = DependecyService.GetDIType(object, k);

                    if(tp == undefined)
                        throw new Error(`Can not resolve the dependecy of ${object.constructor.name}.${k}`);
                        
                    let instance = DependecyService.Resolve(tp);

                    if(instance == undefined)
                        throw new Error(`Can not resolve the dependecy of ${object.constructor.name}.${k}`);

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

    
    
}




interface IService
{
    Type : Function;
    Builder : Function;
}