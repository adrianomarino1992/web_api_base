#!/usr/bin/env node


import Path from 'path';
import FS from 'fs';

export function CreateApp(name?: string)
{
        
    var currentDirectoryPath = Path.join(process.cwd());

    var appName = name ? name : "App";

    var app = `
import { Application, IApplicationConfiguration } from "web_api_base";


export default class ${appName} extends Application
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

    if(FS.existsSync(Path.join(currentDirectoryPath, `${appName}.ts`)))
        console.log(`The class ${appName} already exists`);
    else
    {
        FS.writeFileSync(Path.join(currentDirectoryPath, `${appName}.ts`), app, 'utf-8');
        console.log(`The class ${appName} created : ${Path.join(currentDirectoryPath, `${appName}.ts`)}`);
    }
}


export function CreateIndex(name?: string)
{
    var currentDirectoryPath = Path.join(process.cwd());

    var appName = name ? name : "App";

    var index = `import ${appName} from "./${appName}";

new ${appName}().StartAsync();`;

    if(FS.existsSync(Path.join(currentDirectoryPath, `Index.ts`)))
        console.log(`The file index.ts already exists`);
    else
    {
        FS.writeFileSync(Path.join(currentDirectoryPath, `Index.ts`), index, 'utf-8');
        console.log(`The file index.ts created : ${Path.join(currentDirectoryPath, `index.ts`)}`);
    }

}


export function EnableExperimentalDecorators(tsconfigPath?: string) {

    const currentDirectoryPath = process.cwd();
    const tsconfigFilePath = tsconfigPath
        ? tsconfigPath
        : Path.join(currentDirectoryPath, "tsconfig.json");

    if (!FS.existsSync(tsconfigFilePath)) {
        console.log(`tsconfig.json not found at: ${tsconfigFilePath}`);
        console.log(`You must enable "experimentalDecorators" manually.`);
        return;
    }

    let content = FS.readFileSync(tsconfigFilePath, "utf-8");
    let originalContent = content;

    content = content.replace(
        /\/\/\s*"experimentalDecorators"\s*:\s*true/g,
        `"experimentalDecorators": true`
    );

    content = content.replace(
        /\/\/\s*"emitDecoratorMetadata"\s*:\s*true/g,
        `"emitDecoratorMetadata": true`
    );

    if (content !== originalContent) {
        FS.writeFileSync(tsconfigFilePath, content, "utf-8");
        console.log(`experimentalDecorators / emitDecoratorMetadata enableds ${tsconfigFilePath}`);
    } else {
        console.log(`experimentalDecorators / emitDecoratorMetadata are already enableds.`);
    }
}



export function CreateController(name?: string)
{
        
    var currentDirectoryPath = Path.join(process.cwd());


    var controllerName = name ? name : "SampleController";

    if(!controllerName.endsWith("Controller"))
        controllerName = `${controllerName}Controller`;

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