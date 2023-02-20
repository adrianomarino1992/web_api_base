import File from 'fs';

import IApplicationConfiguration from './interfaces/IApplicationConfiguration';


export default class Configuration implements IApplicationConfiguration
{

    public Host : string = "0.0.0.0";    
    public Port : number = 5555;

    constructor()
    {
        process.env["root_dir"] = __dirname;
    }

    public async StartAsync() : Promise<void>
    {
        if(!await this.CheckFileAsync())
        {
            await this.CreateFileAsync();
            
        }else{

            await this.ReadFileAsync();
        }
    }

    private async CheckFileAsync() : Promise<boolean>
    {
        return new Promise<boolean>((resolve, _) => resolve(File.existsSync(`${__dirname}\\config.json`)));        
    }

    private async ReadFileAsync() : Promise<boolean>
    {
        return new Promise<boolean>((resolve, _) => 
        {
            File.readFile(`${__dirname}\\config.json`, 'utf-8', (error, data) => 
            {
                if(error)
                {
                    throw error;
                }

                let json : any = JSON.parse(data);

                for(let key in this)
                {
                    if(json[key] != undefined)
                    {
                        this[key] = json[key];
                    }
                }

                resolve(true);

            })
        })
    }

    private async CreateFileAsync() : Promise<boolean>
    {

        return new Promise<boolean>((resolve, _)=>{

            File.writeFile(`${__dirname}\\config.json`, JSON.stringify(this), 'utf-8', error => 
            {
                
                if(error)
                {
                    throw error;
                }

                resolve(true);
    
            });   
        })
             
    }

}

