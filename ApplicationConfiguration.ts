import File from 'fs';
import Path from 'path';
import IApplicationConfiguration from './interfaces/IApplicationConfiguration';
import DependecyService, { DIEscope, Ctors } from './dependencyInjection/DependecyService';
import IMidleware, { IRequestResultHandler } from './midlewares/IMidleware';

export default class ApplicationConfiguration implements IApplicationConfiguration
{

    public Host : string = "localhost";    
    public Port : number = 60000;
    public RootPath : string;
    public CurrentWorkingDirectory : string;
    public ConfigJSONFile : string;
    public ExecutablePath : string;
    public DEBUG : boolean;
    public EnviromentVariables : {[key : string] : any} = {};
    private _midlewares : IMidleware[] = [];
    private _afters : IRequestResultHandler[] = []; 

    constructor(){
        
        this.CurrentWorkingDirectory = process.cwd();  
        
        this.ExecutablePath = process.argv[1];       

        this.RootPath = Path.parse(this.ExecutablePath).dir;        
        
        this.ConfigJSONFile = `${this.RootPath}\\config.json`;

        if(process.argv.indexOf("--debug") > -1 || 
        process.argv.indexOf("--DEBUG")  > 1 || 
        process.env.DEBUG ||
        process.env.debug)
            this.DEBUG = true; 
        else 
            this.DEBUG = false;
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

    
    private async CheckFileAsync() : Promise<boolean>
    {
        return new Promise<boolean>((resolve, _) => resolve(File.existsSync(`${this.RootPath}\\config.json`)));        
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

            File.readFile(`${this.RootPath}\\config.json`, 'utf-8', (error, data) => 
            {
                if(error)
                    return reject(error);

                try{

                    let json : any = JSON.parse(data);

                    for(let key in this)
                    {   
                        if(json[key] != undefined && key.indexOf('_') ==-1)
                        {      
                            this[key] = json[key];                            
                        }
                    }
                    
                }catch{}

                this.UpdateEnviroment();

                resolve(true);

            })
        })
    }

    public async SaveAsync() : Promise<boolean>
    {

        return new Promise<boolean>((resolve, reject)=>{

            let copy = JSON.parse(JSON.stringify(this));

            delete copy.RootPath;
            delete copy.DEBUG; 
            delete copy.CurrentWorkingDirectory;
            delete copy.ExecutablePath;
            delete copy._midlewares;
            delete copy._afters;           

            File.writeFile(`${this.RootPath}\\config.json`, JSON.stringify(copy, null, 2), 'utf-8', error => 
            { 
                if(error)
                    return reject(error);

                resolve(true);
    
            });   
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
    }

    private UpdateConfigWithEnviroment() : void
    {        
        for(let k in process.env)
        {
            this.EnviromentVariables[k] = process.env[k];
        }

        if(!!process.env["PORT"])
        {
            let port = Number.parseInt(process.env["PORT"]);

            if(port != Number.NaN)
                this.Port = port;
        }

        if(!!process.env["HOST"])
        {
           this.Host = process.env["HOST"]
        }
    }

}

