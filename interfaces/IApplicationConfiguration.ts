import { Ctors } from "../dependencyInjection/DependecyService";
import IMidleware, { IRequestResultHandler } from "../midlewares/IMidleware";

export default interface IApplicationConfiguration
{
    Host : string;    
    Port : number;
    RootPath : string;
    CurrentWorkingDirectory : string;
    ExecutablePath : string;
    DEBUG : boolean;
    EnviromentVariables : {[key : string] : any};
    
    
    AddScoped<T>(type:  Ctors<T>, ctor?: (new (...args: any[]) => T), builder?: () => any): void;
    AddGenericScoped<T, U>(type: Ctors<T>, genericType?: Ctors<U>, ctor?: new (...args: any[]) => T, builder?: (e?: Ctors<U>) => T): void;
    AddScopedForGenericType<T, U>(type: Ctors<T>, genericType: Ctors<U>, ctor: new (...args: any[]) => T): void;
    AddScopedForGenericArgumentType<T, U>(type: Ctors<T>, builder?: (e?: Ctors<U>) => T): void;
    
    
    AddTransient<T>(type: Ctors<T>, ctor?: new (...args: any[]) => T, builder?: (() => T)): void;
    AddGenericTransient<T, U>(type: Ctors<T>, genericType?: Ctors<U>, ctor?: new (...args: any[]) => T, builder?: (e?: Ctors<U>) => T): void;    
    AddTransientForGenericType<T, U>(type: Ctors<T>, genericType: Ctors<U>, ctor: new (...args: any[]) => T): void;
    AddTransientForGenericArgumentType<T, U>(type: Ctors<T>, builder?: (e?: Ctors<U>) => T): void;
    

    AddSingleton<T>(type: Ctors<T>, ctor?: new (...args: any[]) => T, builder?: () => any): void;
    AddGenericSingleton<T, U>(type: Ctors<T>, genericType?: Ctors<U>, ctor?: new (...args: any[]) => T, builder?: (e?: Ctors<U>) => T): void;
    AddSingletonForGenericType<T, U>(type: Ctors<T>, genericType: Ctors<U>, ctor: new (...args: any[]) => T): void;
    AddSingletonForGenericArgumentType<T, U>(type: Ctors<T>, builder?: (e?: Ctors<U>) => T): void;
    
    
    Use(midleware : IMidleware) : void;    
    Run(resultHandler : IRequestResultHandler) : void
}