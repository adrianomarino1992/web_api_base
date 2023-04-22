import Path from 'path';
import FS from 'fs';

var currentDirectoryPath = Path.join(process.cwd());

var args = process.argv;
var controllerName = "SampleController";

if(args.length >= 3)
{
    controllerName = args[2].trim().toLocaleLowerCase().replace("controller", "");
    controllerName = `${controllerName[0].toLocaleUpperCase()}${controllerName.substring(1)}Controller`;
}

var controller = `
import { ControllerBase, Route, Verb, Action, HTTPVerbs as verbs, Inject, InjectAbstract, Use } from "web_api_base";


@Route()
export default class ${controllerName} extends ControllerBase
{ 
     
    constructor()
    {
        super();              
    }
    
    @Action()
    public Ping() : void
    {       
        this.OK({status : "pong"});
    }
    
}`;

if(!(currentDirectoryPath.endsWith("controllers/") || currentDirectoryPath.endsWith("controllers")))
{
    if(args.length >= 4 && (args[3] == "--createFolder" || args[3] == "-d"))
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