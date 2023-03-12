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

```typescript

import { ControllerBase, HTTPVerbs as verbs, Use, Verb, Route, Action } from "web_api_base";


@Route("/sample")
export default class SampleController extends ControllerBase
{   
    
    @Verb(verbs.GET)    
    @Action("/hello")
    public Hello() : void
    {
        this.OK({message: "Hello Word!"})
    }
    
}
```

### App.ts

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

## Dependecy injection service
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

import { ControllerBase, HTTPVerbs as verbs, Use, Verb, Route, Action } from "web_api_base";
import {SampleServiceAbstract } from '../services/SampleService.ts';

@Route("/sample")
export default class SampleController extends ControllerBase
{   
    @Inject() // say to DI that this property will be inject on the instance
    public SomeDepency : SampleServiceAbstract;

    constructor(someDependecy : SampleServiceAbstract)
    {
        super();
        this.SomeDepency = someDependecy ;        
    }

    @Verb(verbs.GET)    
    @Action("/hello")
    public Hello() : void
    {
        this.OK({message: "Hello Word!"})
    }
    
}
```

And we can register our dependecies in Application ConfigureAsync method

### App.ts

```typescript 

import { Application, IApplicationConfiguration, DependecyService, } from "web_api_base";

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

        // everytime some class need a SampleServiceAbstract it will get a intance of SampleService
        DependecyService.RegisterFor(SampleServiceAbstract, SampleService);     

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