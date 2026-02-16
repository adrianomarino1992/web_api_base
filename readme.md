# WEB_API_BASE

web_api_base is a npm packaged that allows to create web-apis like MVC of .NET

# Installation



```bash
npm install web_api_base
```


---
## Configuration

#### Peer Dependencies

This framework relies on the `reflect-metadata` package to enable runtime type reflection used by decorators.

Make sure it is installed and imported **once** in your application entry point:

```typescript
import 'reflect-metadata';
```

#### Typescript

Decorators and metadata emission must be enabled in your `tsconfig.json`:

```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

These options are required for entity mapping, dependency injection, and relationship metadata to work correctly.

---



# Usage

To get started, you must implement the abstract **Application** class.
After that, you can create your controllers, which must inherit from **ControllerBase**.


### Creating an Application
You can generate an application skeleton using the **create-application** command: : 

```bash
npx create-application [options]
```
#### Options:
       
 __--app/-a=AppName__                

Sets the name of the application class. Default: **App**.

       
 __--controller/-c=ControllerName__ 

Sets the name of the controller class. Default: **SampleController**.


        
__--no-controller__            

 Generates the application without a controller file.
 

### Example: App.ts
```typescript
import { Application, IApplicationConfiguration } from "web_api_base";

export default class App extends Application {   
    
    public override Configure(appConfig: IApplicationConfiguration): void {        
        // Enable CORS
        this.UseCors();

        // If your controllers follow the naming conventions,
        // UseControllersAsync will automatically register them.
        this.UseControllersAsync();

        // Optional: generate documentation during development
        if (appConfig.DEBUG)
            this.CreateDocumentation();
    }  
}

```

## Controllers

All controllers must be placed inside the **`./controllers`** folder.

### Naming Convention

- Controller class names **must end with `Controller`**
- Every controller **must extend `ControllerBase`**

Example:

```typescript
export default class SampleController extends ControllerBase
```

---

## Creating a Controller

You can scaffold a new controller using:

```bash
npx create-controller -c=SampleController
```

This will generate the file inside the `./controllers` directory following the required conventions.

---

## Basic Example

**File:** `./controllers/SampleController.ts`

```typescript
import { ControllerBase, Route, GET, ActionResult } from "web_api_base";

// @Route("some/route") // Optional custom route prefix
export default class SampleController extends ControllerBase {   

    @GET()
    public Hello(): ActionResult {
        return this.OK({ message: "Hello World!" });
    }
}
```

---

## Using Subfolders

Controllers can be organized into subfolders inside the `./controllers` directory.

Example structure:

```
controllers/
 └── admin/
      └── SubController.ts
```

When using subfolders, routes can be composed dynamically using the following placeholders:

- `[folder]` → Name of the subfolder
- `[controller]` → Controller name without the `Controller` suffix

Example:

```typescript
@Route("[folder]/[controller]/test")
```

If the file is located at:

```
controllers/admin/SubController.ts
```

- `[folder]` → `admin`
- `[controller]` → `sub`

Final route:

```
admin/sub/test
```

---

## Route Resolution Rules

| Controller Location | Controller Name | Route Template | Final Route |
|---------------------|-----------------|----------------|-------------|
| controllers/SampleController.ts | SampleController | `[controller]` | `sample` |
| controllers/admin/SubController.ts | SubController | `[folder]/[controller]` | `admin/sub` |
| controllers/sub1/sub2/SubController.ts | SubController | `[folder]/[controller]` | `sub1/sub2/sub` |

---

This approach keeps routes predictable, scalable, and aligned with folder structure — similar to convention-based routing in frameworks like ASP.NET Core.



### Index.ts

```typescript
import 'reflect-metadata';
import App from './App';

new App().StartAsync();
```

# Dependecy Injection

### ATTENTION
#### **Do not** use interfaces for dependency injection. Interfaces do not exist at runtime, so the DI container cannot resolve them.


Below is an example of how to define services and register them using the DI system included in this packag

## Service Definitions
### ./services/SampleService.ts

```typescript
export abstract class SampleServiceAbstract
{
    abstract DoSomething() : void;
}

export class SampleService extends SampleServiceAbstract
{
    public DoSomething(): void {
        console.log("Doing in SampleServices");
    }
}

export class GenericService<T>
{
    public SomeGenericResult<T>(obj : T) {
        console.log("typeof obj: " + typeof obj);
    }
}
```

## Using DI in Controllers
### ./controllers/SampleController.ts

```typescript
import { ControllerBase, Route, GET, Inject } from "web_api_base";
import { SampleServiceAbstract, GenericService } from "../services/SampleService";

@Route()
export default class SampleController extends ControllerBase {   

    @Inject() 
    public SomeDependency!: SampleServiceAbstract;

    @Inject()
    // Generic type arguments do not exist at runtime in the compiled JS output.
    // Even so, the DI container can resolve the correct service instance,
    // and TypeScript still provides full type checking during development.
    public SomeGenericDependency!: GenericService<string>;

    constructor(
        someDependency: SampleServiceAbstract,
        someGenericDependency: GenericService<string>
    ) {
        super();

        this.SomeDependency = someDependency;
        this.SomeGenericDependency = someGenericDependency;

        this.SomeGenericDependency.SomeGenericResult("Test"); // typeof obj: string
        // this.SomeGenericDependency.SomeGenericResult(10);   // TypeScript compiler error
    }
     
    @GET()
    public Hello(): ActionResult {
        return this.OK({ message: "Hello World!" });
    }
}

```


## Registering Dependencies

You can register your services inside the application's **ConfigureAsync** method.

### App.ts

```typescript 

import { Application, IApplicationConfiguration } from "web_api_base";
import { SampleService, SampleServiceAbstract, GenericService } from "./services/SampleService";

export default class App extends Application {
    constructor() {
        super();
    }
    
    public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void> {
        this.UseCors();
        
        // Register a specific implementation for SampleServiceAbstract
        appConfig.AddScoped(SampleServiceAbstract, SampleService);

        // Registers GenericService<T> for any generic type argument
        appConfig.AddScoped(GenericService);

        this.UseControllers();
    }
}


```



### DI for Generic Types

The DI system allows you to register and resolve services based on generic type arguments. This is useful when you want the container to create different implementations depending on the type used in the generic.


```typescript

// Register a service for each specific generic type

// For TestClass → WithGenericType<TestClass> will resolve to TestClassService
appConfig.AddScopedForGenericType(WithGenericType, TestClass, TestClassService);

// For DerivedClass → WithGenericType<DerivedClass> will resolve to DerivedClassService
appConfig.AddScopedForGenericType(WithGenericType, DerivedClass, DerivedClassService);

// Fallback registration for any type not listed above.
// The factory receives the constructor of the generic type argument (T)
// and returns an instance of WithGenericType<T>.
appConfig.AddScopedForGenericArgumentType(
  WithGenericType,
  ctor => new WithGenericType(ctor as new (...args: any[]) => any)
);

```

#### Notes:

Use **AddScopedForGenericType** when you want a specific implementation for a given generic type argument (e.g., TestClass, DerivedClass).

Use **AddScopedForGenericArgumentType** to define a fallback provider for any type argument that does not have a specific mapping.

### Consumption

```typescript

// Register a service for each specific generic type

// For TestClass → WithGenericType<TestClass> will resolve to TestClassService
appConfig.AddScopedForGenericType(WithGenericType, TestClass, TestClassService);

// For DerivedClass → WithGenericType<DerivedClass> will resolve to DerivedClassService
appConfig.AddScopedForGenericType(WithGenericType, DerivedClass, DerivedClassService);

// Fallback registration for any type not listed above.
// The factory receives the constructor of the generic type argument (T)
// and returns an instance of WithGenericType<T>.
appConfig.AddScopedForGenericArgumentType(
  WithGenericType,
  ctor => new WithGenericType(ctor as new (...args: any[]) => any)
);

```

The **@InjectForTypeArgument(SomeClass)** decorator tells the container to resolve the corresponding WithGenericType<SomeClass> instance — following the rules defined during registration.

#### When to Use Each Registration Method

Specific mapping (AddScopedForGenericType)
Use this when you want a customized service for a specific generic type argument.
Example: WithGenericType<TestClass> should behave differently from WithGenericType<DerivedClass>.

Fallback mapping (AddScopedForGenericArgumentType)
Use this to define default behavior for all generic variations not explicitly registered.



# HTTP Verbs decorators

### @GET()
Create a GET endpoint 

### @PUT()
Create a PUT endpoint 

### @POST()
Create a POST endpoint 

### @DELETE()
Create a DELETE endpoint 

# HTTP response status code response

All instances of Controller was the default HTTP response status code response method implementeds

###  OK<T>(result? : T) : OKResult<T>
Send status 200 and a optional body

### Created<T>(result? : T) : CreatedResult<T>
Send status 201 and a optional body

### Accepted<T>(result? : T) : AcceptedResult<T>
Send status 202 and a optional body

### NoContent<T>(result? : T) : NoContentResult<T>
Send status 204 and a optional body

### BadRequest<T>(result? : T) : BadRequestResult<T>
Send status 400 and a optional body

###  Unauthorized<T>(result? : T) : UnauthorizedResult<T>
Send status 401 and a optional body

###  Forbidden<T>(result? : T) : ForbiddenResult<T>
Send status 403 and a optional body

###  NotFound<T>(result? : T) : NotFoundResult<T>
Send status 404 and a optional body

###  Error<T>(result? : T) : ErrorResult<T>
Send status 500 and a optional body


###  SendResponse<T>(status : number, result? : T) : void
Send a status code and a optional body


# Filters
### @UseBefore()
Append a delegate to execute **before** the controller´s action
```typescript
@Route("/status")
@UseBefore(async context => 
{

    if(context.Request.headers["token"] != "we have access to request object")
    {
         context.Response.json({Message : "we have access to response object"});
         return;
    }
    else
         return await context.Next(); // call next function in the pipeline
})
export default class StatusController extends ControllerBase
{
```

### @UseAfter()
Append a delegate to execute **after** the controller´s action
```typescript
@Route("/status")
@UseAfter(async actionResult => 
{

      if(actionResult.Exception) // if a exception was launched
      {
          actionResult.Response.status(500);  // we can access the original request
          actionResult.Response.json({Error : actionResult.Exception.Message});
          return;
      }

      actionResult.Response.status(200);  // we can access the original response
      actionResult.Response.json(actionResult.Result); // we can acess the return of controller´s action   

})
export default class StatusController extends ControllerBase
{
```


### @UseHeader()
Define that the request must have some header
```typescript
@Route("/status")
@UseHeader('api_token')
export default class StatusController extends ControllerBase
{
```


# Model Bind decorators

### @FromBody()
Extract a method parameter type instance from body of request

```json
{
"Name": "Adriano Marino Balera",
"Email": "adriano@gmail.com",
"Age" : 30
}
```

```typescript
 @POST()
 public async InsertAsync(@FromBody()user : User) : Promise<User>
 {  
     return await this._service.AddAsync(user);
 }
```
In the example above, the __model binding system__ will cast the body in a intance of type __User__.

We can extract some part of body using named FromBody args: __@FromBody('user')__. The __model binding system__ will use the 'user' property of body json. 

```json
{
  "user" : 
  {
        "Name": "Adriano Marino Balera",
        "Email": "adriano@gmail.com",
        "Age" : 30
  }
}
```
### @FromQuery()
Extract the method parameter from query string of request

```typescript
@GET()    
public async GetByIdAsync(@FromQuery()id : number) : Promise<OKResult<User>>
{ 
     return this.OK(await this._service.GetByIdAsync(id));
}     
```



### @FromPath()
Extract the method parameter from path params of request

```typescript

@Route(':paRam/path') //add a controller path param
export default class PathParamController extends ControllerBase {

    constructor() {
        super();
    }

    @GET()   //:paRam/path/ping
    public Ping(@FromPath()paRam : string): ActionResult {
        return this.OK({ status: "pong", paRam });
    }

    @GET() 
    @OmmitActionNameOnRoute()   //:paRam/path
    public WithNoName(@FromPath()paRam : string): ActionResult {
        return this.OK({ status: "pong", paRam });
    }
    
    @GET()   //:paRam/path/getatoasync/:cod_param  
    public async GetAtoAsync(@FromPath()paRam: string, @FromPath('cod_param')codigoParam: string): Promise<ActionResult> 
    {
        return this.OK({paRam, codigoParam });
    }

}  
```




### @FromFiles()
Extract a method File(web_api_base) type parameter from multipart/form-data request


```typescript
 @POST()
 public async InsertAsync(@FromFiles()file: File) : Promise<User>
 {  
     await this._storage.SaveAsync(file);
     return this.NoContent();
 }
```


### @JSONProperty('from_json')
Maps a JSON field name to a class property during model binding.

When a request payload is bound to a class instance, the value of the JSON field specified in the decorator is assigned to the decorated property.
When the controller returns the model as a response, the mapping is automatically reversed, converting the class property back to the original JSON field name.

#### Behavior:

Request → Model: from_json → JSONProperty

Response → JSON: JSONProperty→ from_json

This decorator is useful when your API needs to follow a different naming convention (e.g. snake_case) than your TypeScript models (e.g. camelCase).


```typescript
export class SomeClass
{
  ...

  @JSONProperty('from_json')
  public JSONProperty : string;

   ...

}
```
   

## Sample of a complete controller

```typescript 

import { ControllerBase, Route, POST, PUT, DELETE, GET, Inject, Validate, FromBody, FromQuery } from "web_api_base";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import User from "../core/entities/User";

@Validate()
@Route('/v1/users/')
export default class UserController extends ControllerBase
{   
    @Inject()
    private _service : AbstractUserService;

    constructor(service : AbstractUserService)
    {
        super();                    
        this._service = service;
    }
    
    @GET("list")
    public async GetAllAsync() : Promise<OKResult<User[]>>
    {       
        return this.OK(await this._service.GetAllAsync());
    }
    
    @GET("permissions")
    public async GetAllPermissionsAsync() : Promise<OKResult<Permission>>
    {       
        return this.OK(await this._service.GetAllPermissions());
    }

    @GET()    
    public async GetByIdAsync(@FromQuery("id")id : number) : Promise<OKResult<User>>
    { 
       return this.OK(await this._service.GetByIdAsync(id));
    }          
    
    @POST()
    public async InsertAsync(@FromBody()user : User) : Promise<CreatedResult<User>>
    {  
       return this.Created(await this._service.AddAsync(user));
    }
    
    @PUT()   
    public async UpdateAsync(@FromBody()user : User, ) : Promise<ActionResult>
    {        
        if(user.Id == undefined || user.Id <= 0)
            return this.BadRequest({ Message : "The ID must be greater than 0"});

        return this.OK(await this._service.UpdateAsync(user));
    }

    @DELETE()    
    public async DeleteAsync(@FromQuery()id : number) : Promise<ActionResult>
    {  
        let del = await this._service.GetByIdAsync(id);

        if(!del)
            return this.NotFound();

        return this.OK(await this._service.DeleteAsync(del));
    }
}

```


# Validation decorators

### @Validate() 
Say that all arguments from model bind will be validated before injected on the controller action. 
This decorator must be used in the controller declaration.
```typescript
@Validate()
@Route('v1/users/')
export default class UserController extends ControllerBase
```

### @Required()
Determine whether a property of a class is required

### @Max(max : number)
Determine the maximun value of a number property

### @Min(min: number)
Determine the minimun value of a number property

### @MaxLenght(max : number)
Determine the maximun number of characters of a string

### @MaxLenght(min : number)
Determine the minumun number of characters of a string

### @Regex(exp : RegExp)
Determine the pattern expression to validate the string property 

### @Rule<T, U extends keyof T>(action : (arg : T[U]) => boolean)
Determine the delegate used to validate the property 


### Sample of a complete object

```typescript

import {Required, MaxLenght, MinLenght, Rule, Max, Min, Regex}  from 'web_api_base';


export default class ValidatedObject
{
    @Max(10)
    public MaxValue : number;

    @Min(10)
    public MinValue : number;

    @Min(10)
    @Max(20)
    public Range: number;

    @Regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    public RegExp : string;

    @Required()    
    public Required : string;

    @MaxLenght(20)    
    public MaxLenght : string;

    @MinLenght(10)
    public MinLenght : string;
    
    @Rule(p => p.length > 5)    
    public Permissions : string[];

    constructor()
    {
        this.MaxValue = -1;
        this.MinValue = -1;
        this.Range = -1;
        this.Required = "";
        this.MaxLenght = ""; 
        this.MinLenght = ""; 
        this.RegExp = "";
        this.Permissions = [];
    }
}
```

# Auto-generated documentation

We can create a API playground(host/playground) using the Aplication.CreateDocumentation method inside the Application.ConfigureAsync

```typescript
 public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void>
    {  
        this.UseCors();         
        
        await this.UseControllersAsync();

        appConfig.AddScoped(SampleServiceAbstract, AnotherService);

        if(Application.DEBUG)
            this.CreateDocumentation();

    }    
```

# Documentation decorators
We have some decorators to add a more information to our auto-generated documentation

### @ControllerHeader(header : string)
Add a header field to a controller. All requests will have this header on it

### @ActionHeader(header : string)
Add a header field to a controller´s action


### @Description(description : string) 
Add a description text on a action 


### @RequestJson(json : string) 
Add a json template as a placeholder of body field. We can use if we want manually define the json, because, the framework can create the json template base on the argument type of action method 


### @ProducesResponse(response : { Status : number, Description? : string, JSON? : string }) 
Explain all the possibles rsponses of a controller´s action. We can use this decorator many times we need to explain all possible resposes 

### To use the default theme, run the API with **--debug** argument only

[![Alt text](https://raw.githubusercontent.com/adrianomarino1992/web_api_base/master/light.png)](https://raw.githubusercontent.com/adrianomarino1992/web_api_base/master/light.png)

### To use the dark theme, run the API with **--debug --dark** arguments
[![Alt text](https://raw.githubusercontent.com/adrianomarino1992/web_api_base/master/dark.png)](https://raw.githubusercontent.com/adrianomarino1992/web_api_base/master/dark.png)


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)