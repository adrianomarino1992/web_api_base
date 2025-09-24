#!/usr/bin/env node

import {CreateApp, CreateController, CreateIndex, EnableExperimentalDecorators} from './Factory';


if(process.argv.indexOf("--help") != -1 || process.argv.indexOf("--HELP") != -1 || process.argv.indexOf("-h") != -1 || process.argv.indexOf("-H") != -1)
{
    console.log(`
    Usage: 
        CreateApplication [--app=AppName] [--controller=ControllerName] [--no-controller]`);
    console.log(`
    Options:
        --app/-a=AppName               Specify the name of the application class. Default is "App".
        --controller/-c=ControllerName Specify the name of the controller class. Default is "SampleController".
        --no-controller             Do not create a controller class.`);

    console.log(`
    Examples:
        CreateApplication --app=MyApp --controller=MyController
        CreateApplication -a=MyApp -c=MyController
        CreateApplication --no-controller`);   

    process.exit(0);
        
}

let appName = process.argv.find(a => a.startsWith("--app=") || a.startsWith("--APP="));

if(!!appName)
{
    appName = appName!.substring(6).trim();

}else{

    appName = process.argv.find(a => a.startsWith("-a=") || a.startsWith("-A="));
    if(!!appName)
        appName = appName!.substring(3).trim();
}


let controllerName = process.argv.find(a => a.startsWith("--controller=") || a.startsWith("--CONTROLLER="));


if(!!controllerName)
{
    controllerName = controllerName!.substring(13).trim();

}
else{
    controllerName = process.argv.find(a => a.startsWith("-c=") || a.startsWith("-C="));
    if(!!controllerName)
        controllerName = controllerName!.substring(3).trim();
}

let no_controller = process.argv.indexOf("--no-controller") != -1 || process.argv.indexOf("--NO-CONTROLLER") != -1;


CreateApp(appName);

CreateIndex(appName);

EnableExperimentalDecorators();

if(!no_controller)
    CreateController(controllerName);