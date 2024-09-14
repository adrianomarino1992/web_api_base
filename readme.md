# WEB_API_BASE

web_api_base is a npm packaged that allows to create web-apis like MVC of .NET

# Installation



```bash
npm install web_api_base
```


# Usage

First of all we need implement the abstract class __Application__. 
After that, we need to create some controllers and they must inherit  the abstract class __ControllerBase__.

### ./controllers/SampleController.ts

We can create a controller using the __create-controller__ command : 

```bash
npx create-controller
```

```typescript

import { ControllerBase, Route, GET } from "web_api_base";


@Route()
export default class SampleController extends ControllerBase
{   
     
    @GET()
    public Hello() : ActionResult
    {
        return this.OK({message: "Hello Word!"})
    }
    
}
```

### App.ts
We can create a app using the __create-application__ command : 

```bash
npx create-application 
```
 
```typescript
import SampleController from "./controllers/SampleController ";


import { ControllerBase, Application, IApplicationConfiguration, DependecyService } from "web_api_base";

export default class App extends Application
{   
    
    public override Configure(appConfig: IApplicationConfiguration): void
    {        
        //allow CORS
        this.UseCors();

        //if the controlles follow the naming rules, the method UseControllers will automatically append them
        this.UseControllersAsync();   

    }  
}
```

### Index.ts

```typescript
import Application from './Application';

new Application().StartAsync();
```

# Dependecy Injection
Consider this abstraction of a service and some imnplementations

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

export class AnotherService extends SampleServiceAbstract
{
    public DoSomething(): void {
        console.log("Doing another job in AnotherService");
    }
}
```

We can use the DI service like this

### ./controllers/SampleController.ts

```typescript

import { ControllerBase, Route, GET, Inject } from "web_api_base";
import {SampleServiceAbstract } from '../services/SampleService.ts';

@Route()
export default class SampleController extends ControllerBase
{   
    @Inject() // say to DI that this property will be inject on the instance
    public SomeDepency : SampleServiceAbstract;

    constructor(someDependecy : SampleServiceAbstract)
    {
        super();
        this.SomeDepency = someDependecy ;        
    }
     
    @GET()
    public Hello() : ActionResult
    {
        return this.OK({message: "Hello Word!"})
    }
    
}
```

And we can register our dependecies in Application ConfigureAsync method

### App.ts

```typescript 

import { Application, IApplicationConfiguration} from "web_api_base";

import { SampleService, SampleServiceAbstract } from './service/SampleService';


export default class App extends Application
{
    constructor()
    {
        super();
    }
    
    public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void>
    {
        this.UseCors();

        //DI AddScoped, AddTransient and AddSingleton
        App.AddScoped(SampleServiceAbstract, SampleService);     

        this.UseControllers();

    }  
}

```


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
@UseBefore(context => 
{

    if(context.Request.headers["token"] != "we have access to request object")
         context.Response.json({Message : "we have access to response object"});
    else
         context.Next(); // call next function in the pipeline
})
export default class StatusController extends ControllerBase
{
```

### @UseAfter()
Append a delegate to execute **after** the controller´s action
```typescript
@Route("/status")
@UseAfter(actionResult => 
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
In the example above, the __model binding system__ will get the first query argument of request. 
We can also determine the name of parameter: __@FromQuery('id')__. 

### @FromFiles()
Extract a method File(web_api_base) type parameter from multipart/form-data request


```typescript
 @POST()
 public async InsertAsync(@FromFiles()file: File) : Promise<User>
 {  
     return await this._service.MoveFiles(file, newPath);
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

### @Rule<T>(action : (arg : T) => boolean)
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
    
    @Rule<string[]>(p => p.length > 5)    
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
[![Alt text](https://raw.githubusercontent.com/adrianomarino1992/web_api_base/5057c23221750ea4315142e88c7af80c2370682c/dark.png)](https://raw.githubusercontent.com/adrianomarino1992/web_api_base/5057c23221750ea4315142e88c7af80c2370682c/dark.png)


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)