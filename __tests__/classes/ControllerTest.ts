/* istanbul ignore next */

import { AnotherService } from "./AnotherService";
import { SampleServiceAbstract } from "./SampleServiceAbstract";

import {Inject, ControllerBase, Action, Route, GET, POST , FromBody, FromQuery, InjectAbstract, PUT, DELETE} from '../../index';

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

    @GET() 
    @Action("Test")       
    public TestAction(@FromQuery()name : string)
    {
        console.log(name);
    }

    @GET()  
    @Action("Test")   
    public TestActionTwo(@FromQuery("name")name : string, @FromQuery("age")age : number)
    {
        console.log(name, age);
    }    

    @POST()
    public PostAction(@FromBody()user : { Name : string, Age : number}) : { Name : string, Age : number}
    {
        return user;
    }

    @PUT()
    public PutAction(@FromBody()user : { Name : string, Age : number}) : { Name : string, Age : number}
    {
        return user;
    }

    @DELETE()
    public DeleteAction(@FromQuery()id : number) : number
    {
        return id;
    }

}