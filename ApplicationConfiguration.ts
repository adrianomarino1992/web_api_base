import File from 'fs';

import IApplicationConfiguration from './interfaces/IApplicationConfiguration';
import DependecyService, { DIEscope } from './dependencyInjection/DependecyService';

export default class Configuration implements IApplicationConfiguration
{

    public Host : string = "0.0.0.0";    
    public Port : number = 5555;
    public RootPath : string;
    public EnviromentVariables : {[ket : string] : string} = {};

    constructor()
    {        
        this.RootPath = process.cwd() ?? __dirname;        
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

            try{
                
                delete this.EnviromentVariables.ROOT;
                delete this.EnviromentVariables.HOST;
                delete this.EnviromentVariables.PORT;

            }catch{}

            File.writeFile(`${this.RootPath}\\config.json`, JSON.stringify(this), 'utf-8', error => 
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

        this.EnviromentVariables["ROOT"] = this.RootPath;
        this.EnviromentVariables["HOST"] = this.Host;
        this.EnviromentVariables["PORT"] = `${this.Port}`;
    }

}

