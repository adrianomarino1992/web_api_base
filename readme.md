# WEB_API_BASE

web_api_base is a npm packaged that allows to create web-apis like MVC of .NET

## Installation



```bash
npm install web_api_base
```


## Usage

First of all we need implement the abstract class __Application__. 
After that, we need to create some controllers and, they must inherit  the abstract class __ControllerBase__.

### SampleController.ts

```typescript

import { ControllerBase, HTTPVerbs as verbs, Use, Verb, Route, Action } from "web_api_base";
/*

we can use this class to acess all decorators centralized
import { ControllerDecorators as CD } from "web_api_base";

*/

//@CD.Route("/sample")
@Route("/sample")
export default class SampleController extends ControllerBase
{   
    //@CD.Verb(verbs.GET)
    @Verb(verbs.GET)
    //@CD.Action("/hello")
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
        //to define the host use this property, if that property is not changed, the default value will be 0.0.0.0
        appConfig.Host = "127.0.0.1";
        //to define the app port use this property, if that property is not changed, the default value will be 5555
        appConfig.Port = 1234;  
       
        //allow CORS
        this.UseCors();

        //register in DI service
        DependecyService.Register(SampleController);  
    
        //append the controller in the pipe line of requests
        ControllerBase.AppendController(SampleController,this);  

    }  
}
```

### Index.ts

```typescript
import Application from './Application';

new Application().StartAsync();
```



## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)