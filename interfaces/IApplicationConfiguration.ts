export default interface IApplicationConfiguration
{
    Host : string;    
    Port : number;
    RootPath : string;
    CurrentWorkingDirectory : string;
    ExecutablePath : string;
    DEBUG : boolean;
    EnviromentVariables : {[key : string] : any};
    AddScoped(type: Function, ctor?: new (...args: any[]) => any, builder?: (() => any), ): void;
    AddGenericScoped(type: Function, genericType?: Function, ctor?: new (...args: any[]) => any, builder?: (e?: Function) => any): void
    AddTransient(type: Function, ctor?: new (...args: any[]) => any, builder?: () => any): void;
    AddGenericTransient(type: Function, genericType?: Function, ctor?: new (...args: any[]) => any, builder?: (e?: Function) => any): void
    AddSingleton(type: Function, ctor?: new (...args: any[]) => any, builder?: () => any): void;  
    AddGenericSingleton(type: Function, genericType?: Function, ctor?: new (...args: any[]) => any, builder?: (e?: Function) => any): void
        
}