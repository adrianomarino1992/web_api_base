#!/usr/bin/env node

import {CreateController} from './Factory';

if(process.argv.indexOf("--help") != -1 || process.argv.indexOf("--HELP") != -1 || process.argv.indexOf("-h") != -1 || process.argv.indexOf("-H") != -1)
{
    console.log(`
    Usage: 
        CreateController [--controller=ControllerName]`);
    console.log(`
    Options:
        --controller/-c=ControllerName Specify the name of the controller class. Default is "SampleController".`);
    console.log(`
    Examples:
        CreateController --controller=MyController
        CreateController -c=MyController`);

    process.exit(0);


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

CreateController(controllerName);