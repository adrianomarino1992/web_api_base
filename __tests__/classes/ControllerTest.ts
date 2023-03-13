/* istanbul ignore next */

import { SampleServiceAbstract } from "./SampleServiceTest";

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

    constructor(some : SampleServiceAbstract)
    {
        super();
        this.SomeDepency = some;
        this.AnotherDepency = some;
        this._somePrivateDepency = some;
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