# WEB_API_BASE

`web_api_base` is an npm package for building web APIs with decorators, controller conventions, dependency injection, model binding, validation, and an optional API playground.

## Installation

```bash
npm install web_api_base reflect-metadata
```

## Configuration

### Peer dependency

This framework relies on `reflect-metadata` to enable runtime type reflection used by decorators.

Import it once in your application entry point:

```typescript
import "reflect-metadata";
```

### TypeScript

Enable decorators and emitted metadata in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

These options are required for model binding, dependency injection, validation, and metadata-based features.

## Usage

To get started, implement the abstract `Application` class and create controllers that extend `ControllerBase`.

### Creating an application

You can generate an application skeleton with:

```bash
npx create-application [options]
```

Options:

- `--app` or `-a=AppName`: sets the application class name. Default: `App`
- `--controller` or `-c=ControllerName`: sets the controller class name. Default: `SampleController`
- `--no-controller`: generates the application without a sample controller

### Example: `App.ts`

```typescript
import { Application, IApplicationConfiguration } from "web_api_base";

export default class App extends Application {
    public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void> {
        this.UseCors();

        await this.UseControllersAsync();

        if (appConfig.DEBUG) {
            this.CreateDocumentation();
        }
    }
}
```

### Example: `index.ts`

```typescript
import "reflect-metadata";
import App from "./App";

new App().StartAsync();
```

## Controllers

All controllers must be placed inside the `./controllers` folder.

### Naming convention

- Controller class names must end with `Controller`
- Every controller must extend `ControllerBase`

Example:

```typescript
export default class SampleController extends ControllerBase
```

### Creating a controller

You can scaffold a new controller with:

```bash
npx create-controller -c=SampleController
```

This creates the file inside `./controllers`.

### Basic example

**File:** `./controllers/SampleController.ts`

```typescript
import { ControllerBase, GET, Route } from "web_api_base";

@Route()
export default class SampleController extends ControllerBase {
    @GET()
    public Hello() {
        return this.OK({ message: "Hello World!" });
    }
}
```

## Using subfolders

Controllers can be organized into subfolders inside `./controllers`.

Example structure:

```text
controllers/
  admin/
    SubController.ts
```

Routes can be composed dynamically using:

- `[folder]`: the subfolder path
- `[controller]`: the controller name without the `Controller` suffix

Example:

```typescript
@Route("[folder]/[controller]/test")
```

If the file is located at:

```text
controllers/admin/SubController.ts
```

The final route becomes:

```text
admin/sub/test
```

### Route resolution rules

| Controller location | Controller name | Route template | Final route |
|---|---|---|---|
| `controllers/SampleController.ts` | `SampleController` | `[controller]` | `sample` |
| `controllers/admin/SubController.ts` | `SubController` | `[folder]/[controller]` | `admin/sub` |
| `controllers/sub1/sub2/SubController.ts` | `SubController` | `[folder]/[controller]` | `sub1/sub2/sub` |

## Dependency injection

Important: do not use TypeScript interfaces as DI tokens. Interfaces do not exist at runtime, so the container cannot resolve them.

### Service definitions

**File:** `./services/SampleService.ts`

```typescript
export abstract class SampleServiceAbstract {
    public abstract DoSomething(): void;
}

export class SampleService extends SampleServiceAbstract {
    public DoSomething(): void {
        console.log("Doing in SampleService");
    }
}

export class GenericService<T> {
    public SomeGenericResult(obj: T): void {
        console.log("typeof obj: " + typeof obj);
    }
}
```

### Using DI in controllers

**File:** `./controllers/SampleController.ts`

```typescript
import { ControllerBase, GET, Inject, Route } from "web_api_base";
import { GenericService, SampleServiceAbstract } from "../services/SampleService";

@Route()
export default class SampleController extends ControllerBase {
    @Inject()
    public SomeDependency!: SampleServiceAbstract;

    @Inject()
    public SomeGenericDependency!: GenericService<string>;

    constructor(
        someDependency: SampleServiceAbstract,
        someGenericDependency: GenericService<string>
    ) {
        super();

        this.SomeDependency = someDependency;
        this.SomeGenericDependency = someGenericDependency;
    }

    @GET()
    public Hello() {
        this.SomeDependency.DoSomething();
        this.SomeGenericDependency.SomeGenericResult("Test");
        return this.OK({ message: "Hello World!" });
    }
}
```

### Registering dependencies

Register services inside `ConfigureAsync`:

```typescript
import { Application, IApplicationConfiguration } from "web_api_base";
import { GenericService, SampleService, SampleServiceAbstract } from "./services/SampleService";

export default class App extends Application {
    public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void> {
        this.UseCors();

        appConfig.AddScoped(SampleServiceAbstract, SampleService);
        appConfig.AddScoped(GenericService);

        await this.UseControllersAsync();
    }
}
```

### DI for generic types

```typescript
appConfig.AddScopedForGenericType(WithGenericType, TestClass, TestClassService);
appConfig.AddScopedForGenericType(WithGenericType, DerivedClass, DerivedClassService);

appConfig.AddScopedForGenericArgumentType(
    WithGenericType,
    ctor => new WithGenericType(ctor as new (...args: any[]) => any)
);
```

Use `AddScopedForGenericType` when a specific generic argument must resolve to a specific implementation.

Use `AddScopedForGenericArgumentType` as a fallback for generic arguments that do not have an explicit mapping.

### Consuming registrations by generic argument

Use `@InjectForTypeArgument(SomeClass)` when you want the container to resolve the corresponding generic registration for `SomeClass`.

## Configurable logger

The application configuration supports a configurable logger with four levels:

- `Debug`
- `Info`
- `Warn`
- `Error`

If you do not configure anything, the default logger routes every level to `console.log`.

```typescript
import { Application, IApplicationConfiguration, ILogger } from "web_api_base";

class MyLogger implements ILogger {
    public Debug(...args: any[]): void {
        console.debug(...args);
    }

    public Info(...args: any[]): void {
        console.info(...args);
    }

    public Warn(...args: any[]): void {
        console.warn(...args);
    }

    public Error(...args: any[]): void {
        console.error(...args);
    }
}

export default class App extends Application {
    public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void> {
        appConfig.SetLogger(new MyLogger());

        await this.UseControllersAsync();
    }
}
```

## HTTP verb decorators

- `@GET()`: creates a GET endpoint
- `@POST()`: creates a POST endpoint
- `@PUT()`: creates a PUT endpoint
- `@PATCH()`: creates a PATCH endpoint
- `@DELETE()`: creates a DELETE endpoint

`PATCH` can be used with body parameters or only with query/path parameters.

## Response helpers

Controllers inherit response helper methods from `ControllerBase`.

- `OK<T>(result?: T)`: sends status `200`
- `Created<T>(result?: T)`: sends status `201`
- `Accepted<T>(result?: T)`: sends status `202`
- `NoContent<T>(result?: T)`: sends status `204`
- `BadRequest<T>(result?: T)`: sends status `400`
- `Unauthorized<T>(result?: T)`: sends status `401`
- `Forbidden<T>(result?: T)`: sends status `403`
- `NotFound<T>(result?: T)`: sends status `404`
- `Error<T>(result?: T)`: sends status `500`
- `SendResponse<T>(status: number, result?: T)`: sends a custom status code and optional body

## Filters

### `@UseBefore()`

Runs a delegate before the controller action:

```typescript
import { ControllerBase, Route, UseBefore } from "web_api_base";

@Route("/status")
@UseBefore(async context => {
    if (context.Request.headers["token"] !== "expected-token") {
        context.Response.json({ Message: "Access denied" });
        return;
    }

    await context.Next();
})
export default class StatusController extends ControllerBase {
}
```

### `@UseAfter()`

Runs a delegate after the controller action:

```typescript
import { ControllerBase, Route, UseAfter } from "web_api_base";

@Route("/status")
@UseAfter(async actionResult => {
    if (actionResult.Exception) {
        actionResult.Response.status(500);
        actionResult.Response.json({ Error: actionResult.Exception.Message });
        return;
    }

    actionResult.Response.status(200);
    actionResult.Response.json(actionResult.Result);
})
export default class StatusController extends ControllerBase {
}
```

## Model binding decorators

### `@FromBody()`

Extracts a method parameter from the request body.

```typescript
@POST()
public async InsertAsync(@FromBody() user: User): Promise<User> {
    return await this._service.AddAsync(user);
}
```

You can also bind a named property from the body:

```typescript
@POST()
public async InsertAsync(@FromBody("user") user: User): Promise<User> {
    return await this._service.AddAsync(user);
}
```

### `@FromQuery()`

Extracts a method parameter from the query string.

```typescript
@GET()
public async GetByIdAsync(@FromQuery("id") id: number) {
    return this.OK(await this._service.GetByIdAsync(id));
}
```

### `@FromPath()`

Extracts a method parameter from route path parameters.

```typescript
import { ActionResult, ControllerBase, FromPath, GET, OmmitActionNameOnRoute, Route } from "web_api_base";

@Route(":paRam/path")
export default class PathParamController extends ControllerBase {
    @GET()
    public Ping(@FromPath() paRam: string): ActionResult {
        return this.OK({ status: "pong", paRam });
    }

    @GET()
    @OmmitActionNameOnRoute()
    public WithNoName(@FromPath() paRam: string): ActionResult {
        return this.OK({ status: "pong", paRam });
    }

    @GET()
    public async GetAtoAsync(
        @FromPath() paRam: string,
        @FromPath("cod_param") codigoParam: string
    ): Promise<ActionResult> {
        return this.OK({ paRam, codigoParam });
    }
}
```

### `@FromFiles()`

Extracts a `File` parameter from a `multipart/form-data` request.

```typescript
@POST()
public async InsertAsync(@FromFiles() file: File) {
    await this._storage.SaveAsync(file);
    return this.NoContent();
}
```

### `@JSONProperty("from_json")`

Maps a JSON field name to a class property during model binding.

```typescript
export class SomeClass {
    @JSONProperty("from_json")
    public JSONProperty!: string;
}
```

Behavior:

- Request to model: `from_json -> JSONProperty`
- Response to JSON: `JSONProperty -> from_json`

## Complete controller example

```typescript
import {
    ControllerBase,
    CreatedResult,
    FromBody,
    FromQuery,
    GET,
    Inject,
    OKResult,
    POST,
    PUT,
    DELETE,
    Route,
    Validate
} from "web_api_base";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import Permission from "../core/entities/Permission";
import User from "../core/entities/User";

@Validate()
@Route("/v1/users")
export default class UserController extends ControllerBase {
    @Inject()
    private _service!: AbstractUserService;

    constructor(service: AbstractUserService) {
        super();
        this._service = service;
    }

    @GET("list")
    public async GetAllAsync(): Promise<OKResult<User[]>> {
        return this.OK(await this._service.GetAllAsync());
    }

    @GET("permissions")
    public async GetAllPermissionsAsync(): Promise<OKResult<Permission>> {
        return this.OK(await this._service.GetAllPermissions());
    }

    @GET()
    public async GetByIdAsync(@FromQuery("id") id: number): Promise<OKResult<User>> {
        return this.OK(await this._service.GetByIdAsync(id));
    }

    @POST()
    public async InsertAsync(@FromBody() user: User): Promise<CreatedResult<User>> {
        return this.Created(await this._service.AddAsync(user));
    }

    @PUT()
    public async UpdateAsync(@FromBody() user: User) {
        if (user.Id == undefined || user.Id <= 0) {
            return this.BadRequest({ Message: "The ID must be greater than 0" });
        }

        return this.OK(await this._service.UpdateAsync(user));
    }

    @DELETE()
    public async DeleteAsync(@FromQuery("id") id: number) {
        const found = await this._service.GetByIdAsync(id);

        if (!found) {
            return this.NotFound();
        }

        return this.OK(await this._service.DeleteAsync(found));
    }
}
```

## Validation decorators

### `@Validate()`

Enables validation for model-bound arguments before they reach the controller action.

```typescript
@Validate()
@Route("/v1/users")
export default class UserController extends ControllerBase {
}
```

### Available decorators

- `@Required()`: marks a property as required
- `@Max(max: number)`: validates the maximum numeric value
- `@Min(min: number)`: validates the minimum numeric value
- `@MaxLenght(max: number)`: validates the maximum string length
- `@MinLenght(min: number)`: validates the minimum string length
- `@Regex(exp: RegExp)`: validates a string using a regular expression
- `@Rule<T>(action: (arg: T) => boolean)`: validates using a custom rule

### Validated object example

```typescript
import { Max, MaxLenght, Min, MinLenght, Regex, Required, Rule } from "web_api_base";

export default class ValidatedObject {
    @Max(10)
    public MaxValue!: number;

    @Min(10)
    public MinValue!: number;

    @Min(10)
    @Max(20)
    public Range!: number;

    @Regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    public Email!: string;

    @Required()
    public RequiredValue!: string;

    @MaxLenght(20)
    public MaxLengthValue!: string;

    @MinLenght(10)
    public MinLengthValue!: string;

    @Rule<string[]>(items => items.length > 5)
    public Permissions!: string[];
}
```

## Auto-generated documentation

You can expose a playground at `/playground` by calling `CreateDocumentation()` inside `ConfigureAsync`.

```typescript
import { Application, IApplicationConfiguration } from "web_api_base";

export default class App extends Application {
    public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void> {
        this.UseCors();

        await this.UseControllersAsync();

        if (appConfig.DEBUG) {
            this.CreateDocumentation();
        }
    }
}
```

When the application runs in debug mode and `--no-open` is not used, the browser opens the playground automatically.

## Documentation decorators

- `@ControllerHeader(header: string)`: adds a header to all requests in a controller
- `@ActionHeader(header: string)`: adds a header to a specific action
- `@Description(description: string)`: adds a description to an action
- `@RequestJson(json: string)`: overrides the generated request body example
- `@ProducesResponse(response: { Status: number, Description?: string, JSON?: string })`: documents a possible response

### Playground preview

Default theme:

[![Light playground](https://raw.githubusercontent.com/adrianomarino1992/web_api_base/master/light.png)](https://raw.githubusercontent.com/adrianomarino1992/web_api_base/master/light.png)

Dark theme:

[![Dark playground](https://raw.githubusercontent.com/adrianomarino1992/web_api_base/master/dark.png)](https://raw.githubusercontent.com/adrianomarino1992/web_api_base/master/dark.png)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please update tests when appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
