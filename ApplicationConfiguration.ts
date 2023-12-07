import File from 'fs';
import Path from 'path';
import IApplicationConfiguration from './interfaces/IApplicationConfiguration';
import DependecyService, { DIEscope } from './dependencyInjection/DependecyService';

export default class ApplicationConfiguration implements IApplicationConfiguration
{

    public Host : string = "localhost";    
    public Port : number = 60000;
    public RootPath : string;
    public CurrentWorkingDirectory : string;
    public ExecutablePath : string;
    public DEBUG : boolean;
    public EnviromentVariables : {[key : string] : any} = {};

    constructor(){
        
        this.CurrentWorkingDirectory = process.cwd();  
        
        this.ExecutablePath = process.argv[1];       

        this.RootPath = Path.parse(this.ExecutablePath).dir;        
        
        if(process.argv.indexOf("--debug") > -1 || process.argv.indexOf("--DEBUG")  > 1)
            this.DEBUG = true; 
        else 
            this.DEBUG = false;
    }
   
    AddScoped(type: Function, ctor?: (new (...args: any[]) => any) | undefined, builder?: (() => any) | undefined): void
    {
        if(ctor)
        {
            DependecyService.RegisterFor(type, ctor, DIEscope.SCOPED, builder);
        }else{

            DependecyService.Register(type, DIEscope.SCOPED, builder);
        }
    }
    
    AddTransient(type: Function, ctor?: (new (...args: any[]) => any) | undefined, builder?: (() => any) | undefined): void
    {
        if(ctor)
        {
            DependecyService.RegisterFor(type, ctor, DIEscope.TRANSIENT, builder);
        }else{

            DependecyService.Register(type, DIEscope.TRANSIENT, builder);
        }
    }
    
    AddSingleton(type: Function, ctor?: (new (...args: any[]) => any) | undefined, builder?: (() => any) | undefined): void
    {
        if(ctor)
        {
            DependecyService.RegisterFor(type, ctor, DIEscope.SINGLETON, builder);
        }else{

            DependecyService.Register(type, DIEscope.SINGLETON, builder);
        }
    }    

    
    private async CheckFileAsync() : Promise<boolean>
    {
        return new Promise<boolean>((resolve, _) => resolve(File.existsSync(`${this.RootPath}\\config.json`)));        
    }

    public async LoadAsync() : Promise<boolean>
    {
        return new Promise<boolean>(async (resolve, _) => 
        {
            if(!await this.CheckFileAsync())
                return resolve(false);

            File.readFile(`${this.RootPath}\\config.json`, 'utf-8', (error, data) => 
            {
                if(error)
                {
                    throw error;
                }

                try{

                    let json : any = JSON.parse(data);

                    for(let key in this)
                    { 
                        if(json[key] != undefined)
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

        return new Promise<boolean>((resolve, _)=>{

            let copy = JSON.parse(JSON.stringify(this));

            delete copy.RootPath;
            delete copy.DEBUG; 

            File.writeFile(`${this.RootPath}\\config.json`, JSON.stringify(copy), 'utf-8', error => 
            {                
                this.UpdateEnviroment();

                if(error)
                {
                    throw error;
                }

                resolve(true);
    
            });   
        })
             
    }

    private UpdateEnviroment() : void
    {
        for(let k in this.EnviromentVariables)
        {
            process.env[k] = this.EnviromentVariables[k];
        }            
    }

}

