export default class DependecyService
{
    private static _services : IService[] = [];

    public static RegisterFor(type : Function, ctor : { new (...args : any[]) : any;}, builder? : () => any) : void    
    {        
        let defaultBuilder = () =>  Reflect.construct(ctor ?? type, []) as any;

        this._services.push({ Type : type, Builder : builder ?? defaultBuilder });        
    }

    public static Register(type : Function, builder? : () => any) : void
    {
        let defaultBuilder = () => Reflect.construct(type, []);

        this._services.push({ Type : type, Builder : builder ?? defaultBuilder });
    }
    
    public static Resolve<T>(type : Function, args? : any[]) : T
    {
        return this._services.find(u => u.Type == type)?.Builder(args) as T;
    }

    public static ResolveCtor(ctor : Function, args? : any[]) : any
    {
        return this._services.find(u => u.Type == ctor)?.Builder(args);
    }

}


interface IService
{
    Type : Function;
    Builder : Function;
}