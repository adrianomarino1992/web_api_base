import {
    ActionHeader,
    ActionResult,
    ControllerBase,
    ControllerHeader,
    DELETE,
    Description,
    FromBody,
    FromPath,
    FromQuery,
    GET,
    Inject,
    InjectAbstract,
    InjectForTypeArgument,
    OptionalFromBodyArg,
    OptionalFromQueryArg,
    PATCH,
    POST,
    ProducesResponse,
    RequiredFromBodyArg,
    RequiredFromQueryArg,
    UseAfter,
    UseBefore,
    Validate
} from "../TestAPI";
import { ConcreteService, SampleService, SampleServiceAbstract, WithGenericType } from "../service/SampleService";
import GenericService from "../service/GenericService";
import TestClass, { DerivedClass, ItemTest } from "../models/TestClass";
import ValidatedModel from "../models/ValidatedModel";



@UseBefore(context => 
{
    let pipeline = ((context.Request as any).__pipeline ??= []) as string[];
    pipeline.push("controller-before-1");
    return context.Next();
})
@UseBefore(async context => 
{
    let pipeline = ((context.Request as any).__pipeline ??= []) as string[];
    pipeline.push("controller-before-2");
    return await context.Next();
})
@UseAfter(async actionResult => 
{
      actionResult.Response.setHeader("x-controller-after", actionResult.Exception ? "error" : "handled");

      if(actionResult.Exception) 
      {
          actionResult.Response.status(500); 
          actionResult.Response.json({Error : actionResult.Exception.Message});
          return;
      }
      
})
@ControllerHeader("api-key")
@Validate()
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
        some.DoSomething();
        return this.OK({
            status : "OK",
            payloadType: some.constructor.name,
            pipeline: ((this.Request as any).__pipeline ?? []) as string[],
            services: {
                abstract: this.SomeService.constructor.name,
                inferred: this.TypeInferedInjection?.constructor.name,
                concrete: this.ConcreteService?.constructor.name,
                generic: this.GenericDependecy.GetTypeName(),
                genericDerived: this.GenericDerivedDependecy.GetTypeName(),
                withType: this.GenericWithType?.GetType().name,
                withDerivedType: this.GenericWithTypeDerived?.GetType().name,
                withDynamicType: this.GenericWithDefinedTypeDerived?.GetType().name
            }
        });
    }


    @GET() 
    public GetWithPathParams(@FromPath()name : string, @FromPath()age : number) : ActionResult
    {
      
        return this.OK({name, age});
    }

    @GET() 
    public GetWithNoDecorators(name : string, age : number) : ActionResult
    {
      
        return this.OK({name, age});
    }


    @GET('/:lastName') 
    public GetWithPathParamOnRoute(@FromPath()name : string, @FromPath()age : number, @FromPath() lastName : string) : ActionResult
    {
      
        return this.OK({name, age, lastName});
    }

    @GET('/:lastName/user') 
    public GetWithPathParamInsideRoute(@FromPath()name : string, @FromPath()age : number, @FromPath() lastName : string) : ActionResult
    {
      
        return this.OK({name, age, lastName});
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
    public PostWithDecorator(@FromBody()user : TestClass) 
    {
        
        return this.OK(user);
    }

    @POST()   
    public PostOfAny(@FromBody()user : any) 
    {
        
        return this.OK(user);
    }

    @POST()   
    public PostOfEmpty(@FromBody()user : any) 
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


     @POST()       
    public PostOfItemClassAndRunMethod(some : ItemTest) 
    {
        let result = this.GenericDerivedDependecy.Run([some]);
        return result;
    }

   
    @DELETE()
    public DeleteAction(id : number) : number
    {
        return id;
    }


    @POST()       
    public PostOfRequiredBody(some : DerivedClass) 
    {
        let result = this.GenericDerivedDependecy.Run([some]);
        return result;
    }

    @POST()       
    public PostOfRequiredBodyAndCustomMessage(@RequiredFromBodyArg(undefined, "Some argument is required") some : DerivedClass) 
    {
        let result = this.GenericDerivedDependecy.Run([some]);
        return result;
    }

    @POST()       
    public PostOfOptionalBody(@OptionalFromBodyArg() some : DerivedClass) 
    {
        if(!some)
            return this.OK("Some is not provided");

        let result = this.GenericDerivedDependecy.Run([some]);
        return result;
    }
    
    @GET() 
    public GetWithRequiredQueryArg(name : string) : string
    {
        return name;
    }

    @GET() 
    public GetWithRequiredQueryArgAndCustomMessage(@RequiredFromQueryArg(undefined, "Name is required for this GET") name : string) : string
    {
        return name;
    }
    
    @GET() 
    public GetWithOptionalQueryArg(@OptionalFromQueryArg() name : string) : string
    {
        return name ?? "not provided";
    }

    @POST()
    public PostValidatedModel(@FromBody() model: ValidatedModel)
    {
        return this.OK(model);
    }

    @PATCH()
    public PatchPartialRecord(@FromBody() changes: { Name?: string; Email?: string })
    {
        const currentRecord = {
            Id: 1,
            Name: "Original name",
            Email: "original@example.com",
            Active: true
        };

        return this.OK({
            ...currentRecord,
            ...changes
        });
    }

    @PATCH()
    public PatchUsingOnlyQuery(@FromQuery() name: string)
    {
        return this.OK({
            updatedField: "name",
            name
        });
    }
}



