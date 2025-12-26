import { AnotherService } from "./AnotherService";
import { SampleServiceAbstract } from "./SampleServiceAbstract";

import {Inject, ControllerBase, Action, Route, GET, POST , FromBody, FromQuery, InjectAbstract, PUT, DELETE, Description, ActionHeader, ControllerHeader, ProducesResponse, RequestJson, File, FromFiles} from '../../index';

@ControllerHeader("api-token")
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
    @Description("Action test")   
    @ProducesResponse({Status: 200, Description: "Success", JSON: JSON.stringify({Result: "result"}, null, 2)}) 
    @ActionHeader("token")
    public TestAction(@FromQuery()name : string)
    {
        console.log(name);
    }

    @GET()  
    @Action("TestTwo")   
    public TestActionTwo(@FromQuery("name")name : string, @FromQuery("age")age : number)
    {
        console.log(name, age);
    }    

    @POST()
    @ProducesResponse({Status: 200, Description: "Success", JSON: JSON.stringify( { Name : "Adriano", Age : 99}, null, 2)}) 
    @RequestJson(JSON.stringify({user: { Name : "Adriano", Age : 99}}))
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


    @POST()
    public FileUpload(@FromFiles("file.pdf")file: File) : File
    {
        return file;
    }

    @POST()
    public FileUploadOptional(@FromFiles("file.pdf", false)file: File) : File
    {
        return file;
    }

    


}