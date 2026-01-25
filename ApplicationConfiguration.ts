import File from 'fs';
import Path from 'path';
import IApplicationConfiguration from './interfaces/IApplicationConfiguration';
import DependecyService, { DIEscope, Ctors } from './dependencyInjection/DependecyService';
import IMidleware, { IRequestResultHandler } from './midlewares/IMidleware';
import path from 'path';

export default class ApplicationConfiguration implements IApplicationConfiguration
{

    public Host : string = "0.0.0.0";    
    public Port : number = 60000;
    public RootPath : string;
    public CurrentWorkingDirectory : string;
    public EnvFile : string;
    public ExecutablePath : string;
    public DEBUG : boolean;
    public EnviromentVariables : {[key : string] : any} = {};
    private _midlewares : IMidleware[] = [];
    private _afters : IRequestResultHandler[] = []; 

    constructor(){
        
        if(process.env.HOST)
           this.Host = process.env.HOST; 

        if(process.env.PORT)
        {
            let port = Number.parseInt(process.env.PORT)
            if(!Number.isNaN(port))
                this.Port = port;
        }

        this.CurrentWorkingDirectory = process.cwd();  
        
        this.ExecutablePath = process.argv[1];       

        this.RootPath = Path.parse(this.ExecutablePath).dir;        
        

        if(process.argv.indexOf("--debug") > -1 || 
        process.argv.indexOf("--DEBUG")  > 1 || 
        process.env.DEBUG ||
        process.env.debug)
            this.DEBUG = true; 
        else 
            this.DEBUG = false;

         if(this.DEBUG)
            this.EnvFile = path.join(this.RootPath,'.env.dev');
         else
             this.EnvFile = path.join(this.RootPath,'.env');

    }
    
   
    public AddScoped<T>(type:  Ctors<T>, ctor?: (new (...args: any[]) => T), builder?: () => T): void
    {
        if(ctor)
        {
            DependecyService.RegisterFor(type, ctor, DIEscope.SCOPED, builder);
        }else{

            DependecyService.Register(type, DIEscope.SCOPED, builder);
        }
    }
    

    public AddGenericScoped<T, U>(type: Ctors<T>, genericType?: Ctors<U>, ctor?: new (...args: any[]) => T, builder?: (e?: Ctors<U>) => T): void
    {
        DependecyService.RegisterGeneric(type, genericType, ctor, DIEscope.SCOPED, builder);
    }   
    

    public AddScopedForGenericType<T, U>(type: Ctors<T>, genericType: Ctors<U>, ctor: new (...args: any[]) => T): void {

        DependecyService.RegisterGeneric(type, genericType, ctor, DIEscope.SCOPED);
    }

    public AddScopedForGenericArgumentType<T, U>(type: Ctors<T>, builder: (e?: Ctors<U>) => T): void {

        DependecyService.RegisterGeneric(type, undefined, undefined, DIEscope.SCOPED, builder);
    }

    
    public AddTransient<T>(type: Ctors<T>, ctor?: new (...args: any[]) => T, builder?: (() => T)): void
    {
        if(ctor)
        {
            DependecyService.RegisterFor(type, ctor, DIEscope.TRANSIENT, builder);
        }else{

            DependecyService.Register(type, DIEscope.TRANSIENT, builder);
        }
    }



    public AddGenericTransient<T, U>(type: Ctors<T>, genericType?: Ctors<U>, ctor?: new (...args: any[]) => T, builder?: (e?: Ctors<U>) => T): void
    {
        DependecyService.RegisterGeneric(type, genericType, ctor, DIEscope.TRANSIENT, builder);
    }

    public AddTransientForGenericType<T, U>(type: Ctors<T>, genericType: Ctors<U>, ctor: new (...args: any[]) => T): void {

        DependecyService.RegisterGeneric(type, genericType, ctor, DIEscope.TRANSIENT);
    }

    public AddTransientForGenericArgumentType<T, U>(type: Ctors<T>, builder: (e?: Ctors<U>) => T): void {

        DependecyService.RegisterGeneric(type, undefined, undefined, DIEscope.TRANSIENT, builder);
    }

    
    public AddSingleton<T>(type: Ctors<T>, ctor?: new (...args: any[]) => T, builder?: () => T): void
    {
        if(ctor)
        {
            DependecyService.RegisterFor(type, ctor, DIEscope.SINGLETON, builder);
        }else{

            DependecyService.Register(type, DIEscope.SINGLETON, builder);
        }
    }    


    public AddGenericSingleton<T, U>(type: Ctors<T>, genericType?: Ctors<U>, ctor?: new (...args: any[]) => T, builder?: (e?: Ctors<U>) => T): void
    {
        DependecyService.RegisterGeneric(type, genericType, ctor, DIEscope.SINGLETON, builder);
    }

    public AddSingletonForGenericType<T, U>(type: Ctors<T>, genericType: Ctors<U>, ctor: new (...args: any[]) => T): void {

        DependecyService.RegisterGeneric(type, genericType, ctor, DIEscope.SINGLETON);
    }

    public AddSingletonForGenericArgumentType<T, U>(type: Ctors<T>, builder: (e?: Ctors<U>) => T): void {

        DependecyService.RegisterGeneric(type, undefined, undefined, DIEscope.SINGLETON, builder);
    }


    private async CheckFileAsync() : Promise<boolean>
    {
        return new Promise<boolean>((resolve, _) => resolve(File.existsSync(this.EnvFile)));        
    }

    public async LoadAsync() : Promise<boolean>
    {
        return new Promise<boolean>(async (resolve, reject) => 
        {
            if(!await this.CheckFileAsync())
            {                
                this.UpdateConfigWithEnviroment();
                return resolve(false);
            }

            File.readFile(this.EnvFile, 'utf-8', (error, data) => 
            {
                if(error)
                    return reject(error);

                for(let line of data.split(/\r?\n/))
                {
                    if(!line || line.trim().startsWith("#"))
                        continue;

                    if(line.indexOf('=') > 0)
                    {
                        let param = line.substring(0, line.indexOf('=')).trim();

                        let value = "";
                        if(line.indexOf('=') < line.length - 1)
                            value = line.substring((line.indexOf('=') + 1));

                        this.EnviromentVariables[param] = value;
                    }
                }

                this.UpdateEnviroment();

                resolve(true);

            })
        })
    }

    

    public Use(midleware: IMidleware): void 
    {
        this._midlewares.push(midleware);    
    }

    public GetMidlewares()
    {
        return this._midlewares;
    }
    
    public Run(resultHandler: IRequestResultHandler): void 
    {
        this._afters.push(resultHandler);
    }

    public GetResultHandlers()
    {
        return this._afters;
    }

    private UpdateEnviroment() : void
    {
        this.UpdateConfigWithEnviroment();

        for(let k in this.EnviromentVariables)
        {
             process.env[k] = this.EnviromentVariables[k];
        }     
        
        this.UpdateHostAndPort();
    }

    private UpdateConfigWithEnviroment() : void
    {        
        for(let k in process.env)
        {
            this.EnviromentVariables[k] = process.env[k];
        }      
        
        this.UpdateHostAndPort();
    }

    private UpdateHostAndPort()
    {
        if(!!this.EnviromentVariables["PORT"])
        {
            let port = Number.parseInt(this.EnviromentVariables["PORT"]);

            if(port != Number.NaN)
                this.Port = port;
        }

        if(!!this.EnviromentVariables["HOST"])
        {
           this.Host = this.EnviromentVariables["HOST"]
        }
    }

}

