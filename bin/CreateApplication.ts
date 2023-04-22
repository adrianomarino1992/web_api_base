import Path from 'path';
import FS from 'fs';

var currentDirectoryPath = Path.join(process.cwd());

var AppName = "App";

var app = `
import { Application, IApplicationConfiguration } from "web_api_base";


export default class ${AppName} extends Application
{
    constructor()
    {
        super();
    }
    
    public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void>
    {  
      
        this.UseCors();     
        
        this.UseControllers();

    }        

    
}`;


if(FS.existsSync(Path.join(currentDirectoryPath, `${AppName}.ts`)))
    console.log(`The class ${AppName} already exists`);
else
    {
        FS.writeFileSync(Path.join(currentDirectoryPath, `${AppName}.ts`), app, 'utf-8');
        console.log(`The cçass ${AppName} created : ${Path.join(currentDirectoryPath, `${AppName}.ts`)}`);
    }