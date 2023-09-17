export default interface IApplicationConfiguration
{
    Host : string;    
    Port : number;
    RootPath : string;
    DEBUG : boolean;
    EnviromentVariables : {[key : string] : any};
    AddScoped(type: Function, ctor?: (new (...args: any[]) => any) | undefined, builder?: (() => any) | undefined, ): void;
    AddTransient(type: Function, ctor?: (new (...args: any[]) => any) | undefined, builder?: (() => any) | undefined, ): void;
    AddSingleton(type: Function, ctor?: (new (...args: any[]) => any) | undefined, builder?: (() => any) | undefined, ): void;  
        
}