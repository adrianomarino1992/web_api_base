# WEB_API_BASE

web_api_base is a npm packaged that allows to create web-apis like MVC of .NET

## Installation



```bash
npm install web_api_base
```


## Usage

First of all we need implement the abstract class __Application__. 
After that, we need to create some controllers and they must inherit  the abstract class __ControllerBase__.

### ./controllers/SampleController.ts

We can create a controller using the __create-controller__ command : 

```bash
npx create-controller "SampleController" -d
```
Where "SampleController" is the controller name and "__-d__" is the flag to create inside the __controller__ folder. If the folder not exists, the folder will be created. 

```typescript

import { ControllerBase, Route, Action } from "web_api_base";


@Route()
export default class SampleController extends ControllerBase
{   
     
    @Action()
    public Hello() : void
    {
        this.OK({message: "Hello Word!"})
    }
    
}
```

### App.ts
We can create a app using the __create-application__ command : 

```bash
npx create-application "App"
```
Where "App" is the application name. 
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
        this.UseControllers();   

    }  
}
```

### Index.ts

```typescript
import Application from './Application';

new Application().StartAsync();
```

## Dependecy Injection
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

import { ControllerBase, Route, Action, Inject } from "web_api_base";
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
     
    @Action()
    public Hello() : void
    {
        this.OK({message: "Hello Word!"})
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

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)