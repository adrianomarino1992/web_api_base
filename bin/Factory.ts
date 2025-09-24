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

export function EnableExperimentalDecorators(tsconfigPath?: string)
{
    var currentDirectoryPath = Path.join(process.cwd());
    var tsconfigFilePath = tsconfigPath ? tsconfigPath : Path.join(currentDirectoryPath, "tsconfig.json");

    if(!FS.existsSync(tsconfigFilePath))
    {
        console.log(`The file tsconfig.json not exists in ${tsconfigFilePath}`);
        console.log(`You need to enable the experimentalDecorators manually`);
        return;
    }
    var tsconfig = FS.readFileSync(tsconfigFilePath, 'utf-8');

    if(tsconfig.indexOf("// \"experimentalDecorators\": true") != -1)
    {
        tsconfig = tsconfig.replace("// \"experimentalDecorators\": true", "\"experimentalDecorators\": true");
        FS.writeFileSync(tsconfigFilePath, tsconfig, 'utf-8');
        console.log(`The experimentalDecorators is enabled in ${tsconfigFilePath}`);
        return;
    }

    try{
        var json = JSON.parse(tsconfig);

        if(!json.compilerOptions)
            json.compilerOptions = {};
        if(!json.compilerOptions.experimentalDecorators || json.compilerOptions.experimentalDecorators == false)
        {
            json.compilerOptions.experimentalDecorators = true;
            FS.writeFileSync(tsconfigFilePath, JSON.stringify(json, null, 2), 'utf-8');
            console.log(`The experimentalDecorators is enabled in ${tsconfigFilePath}`);
        }
        else
            console.log(`The experimentalDecorators is already enabled in ${tsconfigFilePath}`);
    }catch{
        console.log(`The file tsconfig.json is not valid json in ${tsconfigFilePath}`);
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