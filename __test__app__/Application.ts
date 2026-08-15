
import { Application, IApplicationConfiguration } from "../index";
import Path from 'path';
import GenericService from "./service/GenericService";
import { AnotherService, ConcreteService, DerivedClassService, SampleServiceAbstract, TestClassService, WithGenericType } from './service/SampleService';
import TestClass, { DerivedClass } from "./models/TestClass";


export default class App extends Application
{
    constructor()
    {
        super();
    }
    
    public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void>
    {  
        this.UseCors();         
        
        await this.RegisterControllersAsync();

        appConfig.AddScoped(SampleServiceAbstract, AnotherService);

        appConfig.AddScoped(ConcreteService);

        appConfig.AddScopedForGenericArgumentType(GenericService, e => new GenericService(e as new(...args: any[]) => typeof e));

        appConfig.AddScopedForGenericType(WithGenericType, TestClass, TestClassService);
        
        appConfig.AddScopedForGenericType(WithGenericType, DerivedClass, DerivedClassService);

        appConfig.AddScopedForGenericArgumentType(WithGenericType,  e => new WithGenericType(e as new(...args: any[]) => typeof e));
       

        this.UseStatic("/static", Path.join(this.ApplicationConfiguration.RootPath, "static", "files"));

        appConfig.Use(async context => {
            let pipeline = ((context.Request as any).__pipeline ??= []) as string[];
            pipeline.push("global-before-1");
            return await context.Next();
        });

        appConfig.Use(async context => {
            let pipeline = ((context.Request as any).__pipeline ??= []) as string[];
            pipeline.push("global-before-2");
            return await context.Next();
        });
        
        appConfig.Run(async context => {
            context.Response.setHeader("x-global-after", context.Exception ? "error" : "handled");
        });

        this.CreateDocumentation();

    }        

    protected async RegisterControllersAsync(): Promise<void>
    {
        await this.UseControllersAsync();
    }

    
}
