/* istanbul ignore next */

import { AnotherService, SampleServiceAbstract } from "./SampleServiceTest";

import {Inject, ControllerBase, Action, Route, Verb, Argument, HTTPVerbs, IApplication, InjectAbstract} from '../../index';

@Route("/test")
export class ControllerTest extends ControllerBase
{

    @Inject()
    public SomeDepency : SampleServiceAbstract;

    @InjectAbstract(SampleServiceAbstract)
    public AnotherDepency : SampleServiceAbstract;

    @Inject()
    private _somePrivateDepency : SampleServiceAbstract;

    
    @Inject()
    public TypeInferedInjection? : AnotherService;


    constructor(some : SampleServiceAbstract)
    {
        super();
        this.SomeDepency = some;
        this.AnotherDepency = some;
        this._somePrivateDepency = some;
        this.TypeInferedInjection = undefined;
    }

    @Action("Test")
    @Verb(HTTPVerbs.GET)
    @Argument<string>('name')
    public TestAction(name : string)
    {
        console.log(name);
    }

    @Action("Test")
    @Verb(HTTPVerbs.GET)
    @Argument<string, number>('name', 'age')
    public TestActionTwo(name : string, age : number)
    {
        console.log(name, age);
    }

}