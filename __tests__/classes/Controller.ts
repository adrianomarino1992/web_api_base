/* istanbul ignore next */

import { ControllerBase } from "../../controllers/base/ControllerBase";
import ControllersDecorators from "../../decorators/controllers/ControllerDecorators";
import { HTTPVerbs } from "../../enums/httpVerbs/HttpVerbs";
import IApplication from "../../interfaces/IApplication";
import {Request, Response} from 'express'

@ControllersDecorators.Route("/test")
export class ControllerTest extends ControllerBase
{
    constructor()
    {
        super();
    }

    @ControllersDecorators.Action("Test")
    @ControllersDecorators.Verb(HTTPVerbs.GET)
    @ControllersDecorators.Argument<string>('name')
    public TestAction(name : string)
    {
        console.log(name);
    }

    @ControllersDecorators.Action("Test")
    @ControllersDecorators.Verb(HTTPVerbs.GET)
    @ControllersDecorators.Argument<string, number>('name', 'age')
    public TestActionTwo(name : string, age : number)
    {
        console.log(name, age);
    }


    public AppendSync(application: IApplication): void 
    {
        
    }
}