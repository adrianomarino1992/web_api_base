import Path from 'path';
import FS from 'fs';

export function CreateApp()
{
        
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
            
        await this.UseControllersAsync();

        if(appConfig.DEBUG)
            this.CreateDocumentation();

    }        

        
}`;

    if(FS.existsSync(Path.join(currentDirectoryPath, `${AppName}.ts`)))
        console.log(`The class ${AppName} already exists`);
    else
    {
        FS.writeFileSync(Path.join(currentDirectoryPath, `${AppName}.ts`), app, 'utf-8');
        console.log(`The class ${AppName} created : ${Path.join(currentDirectoryPath, `${AppName}.ts`)}`);
    }
}


export function CreateController()
{
        
    var currentDirectoryPath = Path.join(process.cwd());


    var controllerName = "SampleController";

    var controller = `
import { ControllerBase, Route, GET, ProducesResponse, ActionResult } from "web_api_base";


@Route()
export default class ${controllerName} extends ControllerBase
{ 
        
    constructor()
    {
        super();              
    }
        
    @GET()
    @ProducesResponse({ Status : 200, Description: "OK", JSON : JSON.stringify({status : "pong"}, null, 2)})
    public Ping() : ActionResult
    {       
        return this.OK({status : "pong"});
    }
        
}`;

    if(!(currentDirectoryPath.endsWith("controllers/") || currentDirectoryPath.endsWith("controllers")))
    {
        currentDirectoryPath = Path.join(currentDirectoryPath, "controllers");

        if(!FS.existsSync(currentDirectoryPath))
            FS.mkdirSync(currentDirectoryPath);    
    }

    if(FS.existsSync(Path.join(currentDirectoryPath, `${controllerName}.ts`)))
        console.log(`The controller ${controllerName} already exists`);
    else
    {
        FS.writeFileSync(Path.join(currentDirectoryPath, `${controllerName}.ts`), controller, 'utf-8');
        console.log(`The controller ${controllerName} created : ${Path.join(currentDirectoryPath, `${controllerName}.ts`)}`);
    }

}