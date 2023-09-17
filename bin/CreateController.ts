import Path from 'path';
import FS from 'fs';

var currentDirectoryPath = Path.join(process.cwd());

var controllerName = "SampleController";

var controller = `
import { ControllerBase, Route, Action, ProducesResponse } from "web_api_base";


@Route()
export default class ${controllerName} extends ControllerBase
{ 
     
    constructor()
    {
        super();              
    }
    
    @Action()
    @ProducesResponse({ Status : 200, Description: "OK", JSON : JSON.stringify({status : "pong"}, null, 2)})
    public Ping() : void
    {       
        this.OK({status : "pong"});
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