import { ControllerBase, FileService, Route, Inject, InjectAbstract, UseBefore,  FromBody, DELETE, FromQuery, GET, POST, PUT, Description, ProducesResponse, ActionResult, FromFiles, ControllerHeader, ActionHeader,  UseAfter, InjectForTypeArgument } from "../../index";
import { ConcreteService, SampleService, SampleServiceAbstract, WithGenericType } from "../service/SampleService";
import {File} from '../../index';
import Path from 'path';
import GenericService from '../../__tests__/classes/GenericService';

import TestClass, { DerivedClass, ItemTest } from "./TestClass";



@UseBefore(context => 
{
    console.debug("First midleware");
    return context.Next();
})
@UseBefore(async context => 
{
    console.debug("Second midleware");       
    return await context.Next();
})
@UseAfter(async actionResult => 
{

      if(actionResult.Exception) 
      {
          actionResult.Response.status(500); 
          actionResult.Response.json({Error : actionResult.Exception.Message});
          return;
      }

      console.log(actionResult) 
      
})
@ControllerHeader("api-key")
export default class StatusController extends ControllerBase
{   
    @InjectAbstract(SampleServiceAbstract)
    public SomeService : SampleServiceAbstract;

    @Inject()
    public TypeInferedInjection? : SampleServiceAbstract;


    @Inject()
    public ConcreteService?: ConcreteService

    @Inject()
    public GenericDependecy : GenericService<TestClass>; 
    
    @InjectForTypeArgument(DerivedClass)
    public GenericDerivedDependecy : GenericService<DerivedClass>;


    @InjectForTypeArgument(TestClass)
    public GenericWithType? : WithGenericType<TestClass>;

    @InjectForTypeArgument(DerivedClass)
    public GenericWithTypeDerived? : WithGenericType<DerivedClass>;
    
    @InjectForTypeArgument(ItemTest)
    public GenericWithDefinedTypeDerived? : WithGenericType<ItemTest>;

     
    constructor(dependecy : SampleServiceAbstract, genericDependecy : GenericService<TestClass>, derived : GenericService<DerivedClass>)
    {
        super();
        this.SomeService = dependecy;
        this.TypeInferedInjection = undefined;     
        this.GenericDependecy = genericDependecy;  
        this.GenericDerivedDependecy = derived;
    }

    @ActionHeader("token")
    @POST("/check")
    @Description("Action to check API status")
    @ProducesResponse({ Status : 200, Description: "OK", JSON : JSON.stringify({status : "OK"}, null, 2)})
    @ProducesResponse({ Status : 400, Description: "Bad request", JSON : JSON.stringify({Message : "Error message"}, null, 2)})
    @ProducesResponse({ Status : 500, Description: "Error", JSON : JSON.stringify({Message : "Error while processing the request"}, null, 2)})
    public CheckStatus(@FromBody()some : SampleService) 
    {       
        console.log(this.ConcreteService);
        console.log(this.GenericWithType);
        console.log(this.GenericWithTypeDerived);
        console.log(this.GenericWithDefinedTypeDerived);
        some.DoSomething();
        return this.OK({status : "OK"});
    }

    @GET() 
    public GetWithNoDecorators(name : string, age : number) : ActionResult
    {
      
        return this.OK({name, age});
    }


    @GET() 
    public async GetWithFromQueryDecoratorReturningActionResult(@FromQuery()name : string) : Promise<ActionResult>
    {
        
        return this.OK({name});
    }

    
    @GET() 
    public GetWithFromQueryDecoratorReturningString(@FromQuery()name : string) : string
    {
        return name;
    }
    
  


    
    @GET() 
    public GetWithOneParamWithDecorator(@FromQuery()date : Date, number : number, bool: boolean) : ActionResult
    {
        
        return this.OK({date, number, bool});
    }



    @GET()  
    public GetWithDecorators(@FromQuery("nome")name : string, @FromQuery()age : number)
    {
        
        return this.OK({ name, age});
    }    


    @POST()  
    public async UploadFileWithDecorator(@FromQuery("name")name : string, @FromQuery()age : number, @FromFiles()file: File)
    {
        await this.CreateFilesDirAsync();        
        let fs = new FileService();
        await fs.CopyAsync(file.Path, Path.join(this._uploadsDir, file.FileName));
        await fs.DeleteAsync(file.Path);
        return this.OK({ name, age, file});
    }  


    private _uploadsDir = Path.join(__dirname, "uploads");

    private async CreateFilesDirAsync()
    {
        const fs = new FileService();

        if(!(await fs.DirectoryExistsAsync(this._uploadsDir)))
            await fs.CreateDirectoryAsync(this._uploadsDir);        
    }
    
    @POST()  
    public async UploadFileWithNoDecorator(name : string, age : number, file: File)
    {
        await this.CreateFilesDirAsync();
       
        let fs = new FileService();
        await fs.CopyAsync(file.Path, Path.join(this._uploadsDir, file.FileName));
        await fs.DeleteAsync(file.Path);
        return this.OK({ name, age, file});
    }  

     @GET()  
    public async GetListOfFiles()
    {        
         await this.CreateFilesDirAsync();
        let fs = new FileService();
        let files = await fs.GetAllFilesAsync(this._uploadsDir);
        
        if(files.length == 0)
            return this.NotFound();
        
        return this.OK(files);
    } 

    @GET()  
    public async SendFileAsync()
    {        
         await this.CreateFilesDirAsync();
        let fs = new FileService();
        let files = await fs.GetAllFilesAsync(this._uploadsDir);

         if(files.length == 0)
            return this.NotFound();

        return this.SendFile(files[0]);
    }   
    
    @GET()  
    public async DownloadFileAsync()
    {        
         await this.CreateFilesDirAsync();
        let fs = new FileService();
        let files = await fs.GetAllFilesAsync(this._uploadsDir);
        
        if(files.length == 0)
            return this.NotFound();
        
        return this.DownloadFile(files[0]);
    }   

    @POST()   
    public PostWithDecorator(@FromBody()user : TestClass) 
    {
        
        return this.OK(user);
    }

    
    @POST()   
    public PostWithNoDecorator(user : TestClass) 
    {
        
        return this.OK(user);
    }

    
    @POST()   
    public PostOfDerivedClass(user : DerivedClass) 
    {        
        return this.OK(user);
    }
    
    
    @POST()       
    public PostOfDerivedClassAndRunMethod(some : DerivedClass) 
    {
        let result = this.GenericDerivedDependecy.Run([some]);
        return result;
    }

   
    @DELETE()
    public DeleteAction(id : number) : number
    {
        return id;
    }
    
}
