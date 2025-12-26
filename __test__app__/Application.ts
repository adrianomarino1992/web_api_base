

import GenericService from "../__tests__/classes/GenericService";
import { Application, IApplicationConfiguration } from "../index";
import Path from 'path';
import { AnotherService, ConcreteService, DerivedClassService, SampleServiceAbstract, TestClassService, WithGenericType } from './service/SampleService';
import TestClass, { DerivedClass } from "./controllers/TestClass";


export default class App extends Application
{
    constructor()
    {
        super();
    }
    
    public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void>
    {  
        this.UseCors();         

        console.log(process.env)
        
        await this.UseControllersAsync();

        appConfig.AddScoped(SampleServiceAbstract, AnotherService);

        appConfig.AddScoped(ConcreteService);

        appConfig.AddScopedForGenericArgumentType(GenericService, e => new GenericService(e as new(...args: any[]) => typeof e));

        appConfig.AddScopedForGenericType(WithGenericType, TestClass, TestClassService);
        
        appConfig.AddScopedForGenericType(WithGenericType, DerivedClass, DerivedClassService);

        appConfig.AddScopedForGenericArgumentType(WithGenericType,  e => new WithGenericType(e as new(...args: any[]) => typeof e));

       

        this.UseStatic("/static", Path.join(this.ApplicationConfiguration.RootPath, "static", "files"));

        appConfig.Use(async context => {

            console.log(context.Request.url);
            return await context.Next();
        });

        appConfig.Use(async context => {

            console.log('second-global-midleware', context.Request.ip);
            return await context.Next();
        });
        
        appConfig.Run(async context => {
            console.log(context.Result);             
        });

        this.CreateDocumentation();

    }        

    
}