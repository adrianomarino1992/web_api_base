import { Express } from "express";
import ExpressModule from "express";
import ApplicationConfiguration from "./ApplicationConfiguration"
import IApplication, { ApplicationExceptionHandler } from "./interfaces/IApplication";
import IApplicationConfiguration from "./interfaces/IApplicationConfiguration";
import IController from "./interfaces/IController";
import ControllersDecorators from './decorators/controllers/ControllerDecorators';
import DependecyService from './dependencyInjection/DependecyService';
import { HTTPVerbs } from "./enums/httpVerbs/HttpVerbs";
import { Request, Response } from "express";
import File from 'fs';
import Path from 'path';
import { IHTTPRequestContext } from "./midlewares/IMidleware";
import ValidationDecorators from "./decorators/validations/ValidationDecorators";
import ControllerLoadException from "./exceptions/ControllerLoadException";
import Exception from "./exceptions/Exception";
import Documentation from "./documentation/Documentation";
import { ControllerBase } from "./controllers/base/ControllerBase";
import GenericResult from "./controllers/GenericResult";
import ActionResult from "./controllers/ActionResult";
import BodyParseException from "./exceptions/BodyParseException";

export default abstract class Application implements IApplication {

    public static Configurations: IApplicationConfiguration;

    private _createdControllers: { new(...args: any[]): IController }[] = [];

    private _URIs : {URI: string, Controller: string}[] = [];

    public ApplicationConfiguration: IApplicationConfiguration;

    public Express: Express;

    public ApplicationThreadExeptionHandler?: ApplicationExceptionHandler;

    constructor() {

        this.ApplicationConfiguration = new ApplicationConfiguration();

        this.Express = ExpressModule();

    }


    public async StartAsync(): Promise<void> {
        await (this.ApplicationConfiguration as ApplicationConfiguration).LoadAsync();

        Application.Configurations = this.ApplicationConfiguration;

        this.Express.use(ExpressModule.json({ limit: 50 * 1024 * 1024 }));      

        await this.ConfigureAsync(this.ApplicationConfiguration);

        if(this.ApplicationConfiguration)
            this.Express.use((e : any, rq : any, rs : any, n : any) => 
            {
                if(e && e instanceof Error && e instanceof SyntaxError)
                {
                    let b = new BodyParseException(e.message);
                    b.stack = e.stack;
                    this.CallErrorHandler(rq, rs, b);
                }
                else
                    n();                    
            });

        await (this.ApplicationConfiguration as ApplicationConfiguration).SaveAsync();

        this.Express.listen(this.ApplicationConfiguration.Port, this.ApplicationConfiguration.Host, () => {
            console.log(`Application running on ${this.ApplicationConfiguration.Host}:${this.ApplicationConfiguration.Port}`);
        });
    }

    public UseCors(): void {
        this.Express.use(require('cors')());
    }

    private GetIgnoredPaths(): string[] {
        return [
            ".git",
            ".vscode",
            "coverage",
            "node_modules"
        ]
    }

    private TryFindControllerFolder(path: string): string | undefined {

        if (this.GetIgnoredPaths().filter(s => path.endsWith(s)).length > 0)
            return undefined;

        if (path.indexOf("node_modules") > -1)
            return undefined;

        if (!File.existsSync(path))
            return undefined;

        if (File.readdirSync(path).filter(s => s.toLowerCase().endsWith("controller.js")).length > 0)
            return path;

        let folder = File.readdirSync(path).filter(s => !File.lstatSync(Path.join(path, s)).isFile());

        if (folder.length == 0)
            return undefined;

        for (let f of folder) {
            let find = this.TryFindControllerFolder(Path.join(path, f));

            if (find && find.toLowerCase().endsWith("controllers"))
                return find;

        }

        return undefined;
    }



    protected UseControllersAsync(root?: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {

            let controllersPath: string | undefined = this.TryFindControllerFolder(Path.join(root ?? this.ApplicationConfiguration.RootPath, "controllers"));

            if (!controllersPath)
                controllersPath = this.TryFindControllerFolder(root ?? this.ApplicationConfiguration.RootPath);

            if (!controllersPath || !File.existsSync(controllersPath!))
                return;

            console.debug(`reading controllers in ${controllersPath}`);

            let files: string[] = File.readdirSync(controllersPath).filter(s => s.toLowerCase().endsWith("controller.js"));

            for (let controllerFile of files) {


                let controllerModule = await import(Path.join(controllersPath, controllerFile));

                let controllerClass: any | undefined = undefined;

                if (controllerModule.default == undefined) {

                    for (let c in controllerModule) {
                        if (c.toLowerCase().endsWith("controller")) {
                            controllerClass = controllerModule[c];
                        }
                    }

                } else
                    controllerClass = controllerModule.default;

                if (controllerClass == undefined)
                    throw new ControllerLoadException(`Can find any controller from file : ${controllerFile}`);

                let controller = Reflect.construct(controllerClass.prototype.constructor, []) as IController;

                if (controller != undefined && controller != null) {
                    this.AppendController(controllerClass.prototype.constructor);

                } else {

                    throw new ControllerLoadException(`Can not load ${controllerClass.name} controller from file : ${controllerFile}`);
                }


            }

            resolve();


        })


    }


    protected AppendController<T extends ControllerBase>(ctor: { new(...args: any[]): T; }): void {
        let empty = new ctor() as any;

        let methods = Reflect.ownKeys(empty.constructor.prototype).filter(m => {
            return typeof empty[m] == "function";
        })

        let route = ControllersDecorators.GetRoute(empty);
        let validateBody = ControllersDecorators.IsToValidate(empty);

        if (!route)
            return;

        this._createdControllers.push(ctor);

        for (let method of methods) {
            let action = ControllersDecorators.GetAction(empty, method.toString());

            if (!action) {
                continue;
            }

            let verb = ControllersDecorators.GetVerb(empty, method.toString());
            let fromBody = ControllersDecorators.GetFromBodyArgs(empty.constructor, method.toString());
            let fromQuery = ControllersDecorators.GetFromQueryArgs(empty.constructor, method.toString());

            if (!verb)
                verb = HTTPVerbs.GET;            

            if(verb == HTTPVerbs.GET && fromBody.length > 0)
                throw new ControllerLoadException(`GET method: ${ctor.name}.${method.toString()} can not have body params`);

            let collision = this._URIs.filter(s => s.URI == `${route}${action}`);
            
            if(collision.length > 0)
                throw new ControllerLoadException(`The URI: ${route}${action} exists in two controllers: ${collision[0].Controller} and ${ctor.name}.${method.toString()}`);

            console.debug("appended : ", verb, `${route}${action}`);

            this._URIs.push({ URI : `${route}${action}`, Controller : `${ctor.name}.${method.toString()}`});

            (this.Express as any)[verb.toString().toLowerCase()](`${route}${action}`, (request: Request, response: Response) => {

                let midlewares = ControllersDecorators.GetMidlewares(empty).reverse();

                midlewares.push(...ControllersDecorators.GetBefores(empty, method.toString()).reverse());


                let afters = ControllersDecorators.GetMidlewaresAfter(empty).reverse();

                afters.push(...ControllersDecorators.GetAfters(empty, method.toString()).reverse());

                let handler = (context: IHTTPRequestContext) => {

                    let params: any[] = [];

                    let ts = Reflect.getMetadata("design:paramtypes", empty, method.toString()) ??
                        Reflect.getMetadata("design:paramtypes", empty.constructor, method.toString());

                    let fromBodyParams: any[] = [];
                    if (fromBody.length > 0) {
                        fromBody.sort((a, b) => a.Index - b.Index).forEach(f => {
                            let obj = undefined;

                            if (!f.Field || f.Type.name == "Object")
                                obj = request.body;
                            else
                                obj = request.body[f.Field];

                            if (["string", "number", "boolean", "bigint"].filter(s => s == ts[f.Index].name.toLowerCase()).length == 0) {
                                try {
                                    obj.__proto__ = ts[f.Index];
                                } catch { }

                                if (f.Type.name == "Object") {
                                    fromBodyParams.push(obj);
                                    params[f.Index] = obj;

                                } else {

                                    let t = Reflect.construct(ts[f.Index], []) as any;
                                    Object.assign(t, obj);

                                    fromBodyParams.push(t);
                                    params[f.Index] = t;
                                }
                            } else {
                                if (obj != undefined && typeof obj == "string" && obj.indexOf('"') == 0 && obj.lastIndexOf('"') == obj.length - 1)
                                    obj = obj.substring(1, obj.length - 1);

                                if (obj != undefined && ts[f.Index].name.toLowerCase() == "number") {
                                    let number = Number.parseFloat(obj.toString());

                                    if (number != Number.NaN) {
                                        fromBodyParams.push(number);
                                        params[f.Index] = number;
                                    }

                                } else if (obj != undefined && ts[f.Index].name.toLowerCase() == "string") {
                                    fromBodyParams.push(obj.toString());
                                    params[f.Index] = obj.toString();
                                }
                                else if (obj != undefined && ts[f.Index].name.toLowerCase() == "date") {
                                    try {

                                        fromBodyParams.push(new Date(obj));
                                        params[f.Index] = new Date(obj);

                                    } catch { }
                                }
                                else {
                                    fromBodyParams.push(obj);
                                    params[f.Index] = obj;
                                }
                            }
                        });
                    }

                    let fromQueryParams: any[] = [];
                    if (fromQuery.length > 0) {
                        fromQuery.sort((a, b) => a.Index - b.Index).forEach((f, j) => {
                            let obj: string | undefined;

                            obj = request.query[f.Field]?.toString();

                            if (obj != undefined && typeof obj == "string" && obj.indexOf('"') == 0 && obj.lastIndexOf('"') == obj.length - 1)
                                obj = obj.substring(1, obj.length - 1);

                            if (obj != undefined && f.Type.name.toLowerCase() == "number") {
                                let number = Number.parseFloat(obj.toString());

                                if (number != Number.NaN) {
                                    fromQueryParams.push(number);
                                    params[f.Index] = number;
                                }

                            } else if (obj != undefined && f.Type.name.toLowerCase() == "string") {
                                fromQueryParams.push(obj.toString());
                                params[f.Index] = obj.toString();
                            }
                            else if (obj != undefined && f.Type.name.toLowerCase() == "date") {
                                try {

                                    fromQueryParams.push(new Date(obj));
                                    params[f.Index] = new Date(obj);

                                } catch { }

                            }
                            else if (obj != undefined && f.Type.name.toLowerCase() == "boolean") {
                                try {

                                    if (typeof obj != "boolean") {

                                        let v = obj.toString().toLowerCase() == "true";
                                        fromQueryParams.push(v);
                                        params[f.Index] = v;
                                    }
                                    else {
                                        fromQueryParams.push(obj);
                                        params[f.Index] = obj;
                                    }

                                } catch { }

                            }
                            else {
                                fromQueryParams.push(obj);
                                params[f.Index] = obj;
                            }
                        });
                    }


                    if (validateBody) {

                        if (fromBody.length > 0) {
                            let modelBindErros = [];

                            for (let p of fromBody) {
                                if (p.Required && (params.length <= p.Index || params[p.Index] == undefined)) {
                                    modelBindErros.push(p);
                                }
                            }

                            if (modelBindErros.length > 0) {
                                response.status(400);
                                response.json(
                                    {
                                        Message: "Model binding fail",
                                        Detailts: modelBindErros.map(s => `Parameter "${s.Field}" is required`)
                                    });
                                return;
                            }

                        }

                        if (fromQuery.length > 0) {
                            let modelBindErros = [];

                            for (let p of fromQuery) {
                                if (p.Required && (params.length <= p.Index || params[p.Index] == undefined)) {
                                    modelBindErros.push(p);
                                }
                            }

                            if (modelBindErros.length > 0) {
                                response.status(400);
                                response.json(
                                    {
                                        Message: "Model binding fail",
                                        Detailts: modelBindErros.map(s => `Parameter "${s.Field}" is required`)
                                    });
                                return;
                            }

                        }

                        let validationsErrors: string[] = [];

                        for (let a of fromBodyParams) {
                           try{
                            validationsErrors.push(...ValidationDecorators.Validate<typeof a>(a).map(s => s.Message));
                           }catch{}
                        }

                        if (validationsErrors.length > 0) {
                            response.status(400);
                            response.json(
                                {
                                    Message: "Validation fail",
                                    Detailts: validationsErrors
                                });
                            return;
                        }
                    }


                    let controller = DependecyService.ResolveCtor(empty.constructor) as ControllerBase;

                    if (controller == undefined)
                        controller = new ctor() as ControllerBase;

                    try {

                        DependecyService.CheckForDependenciesAndResolve(controller);

                    } catch (err) {
                        this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                    }

                    controller.Request = context.Request;
                    controller.Response = context.Response;

                    try {

                        let exceutionTask = (controller as any)[method](...params);

                        if (exceutionTask instanceof Promise) {
                            exceutionTask.then(c => {
                                for (let afterHandler of afters) {
                                    afterHandler(
                                        {
                                            Request: request,
                                            Response: response,
                                            Result: exceutionTask
                                        });
                                }

                                this.SendResponseIfNecessary(controller, response, c);

                                

                            }).catch(err => {
                                for (let afterHandler of afters) {

                                    afterHandler(
                                        {
                                            Exception: this.CastToExpection(err as Error),
                                            Request: request,
                                            Response: response
                                        });
                                }

                                if (afters.length == 0)
                                    this.CallErrorHandler(request, response, this.CastToExpection(err as Error));


                            });

                        }
                        else {

                            for (let afterHandler of afters) {
                                try {
                                    afterHandler(
                                        {
                                            Request: request,
                                            Response: response,
                                            Result: exceutionTask
                                        });
                                } catch (err) {
                                    this.CallErrorHandler(request, response, this.CastToExpection(err as Error))
                                }
                            }

                            this.SendResponseIfNecessary(controller, response, exceutionTask);                          

                        }



                    }
                    catch (err) {
                        for (let afterHandler of afters) {
                            try {

                                afterHandler(
                                    {
                                        Exception: this.CastToExpection(err as Error),
                                        Request: request,
                                        Response: response
                                    });

                            } catch (err) {
                                this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                            }
                        }

                        if (afters.length == 0)
                            this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                    }
                }

                if (midlewares && midlewares.length > 0) {

                    let httpRequestContexts: IHTTPRequestContext[] = [];

                    let pipeline: any[] = [];

                    for (let i = 0; i <= midlewares.length; i++) {

                        httpRequestContexts.push(
                            {
                                Request: request,
                                Response: response,
                                Next: () => { }
                            });

                    }

                    for (let i = 0; i < httpRequestContexts.length; i++) {
                        let box =
                        {
                            v: i
                        };


                        pipeline.push(
                            {
                                Execute: () => {

                                    pipeline.length - 1 == box.v ? handler(httpRequestContexts[box.v]) : midlewares[box.v](httpRequestContexts[box.v])

                                }
                            });
                    }

                    for (let i = 0; i < pipeline.length; i++) {
                        httpRequestContexts[i].Next = i == pipeline.length - 1 ? () => { } : () => pipeline[i + 1].Execute();
                    }


                    pipeline[0].Execute();
                }
                else {

                    handler({
                        Request: request,
                        Response: response,
                        Next: () => { }
                    });

                }


            })
        }

    }

    public CreateDocumentation(): void {
        new Documentation().CreateDocumentation(this._createdControllers, this.Express);
    }

    private SendResponseIfNecessary(controller : ControllerBase, response : Response, result : any) : void
    {
        if(response.headersSent)return;

        if(!result)
        {           
            controller.SendResponse(204); 
            return;
        }

        if(result instanceof ActionResult)
        {
           controller.SendResponse(result.StatusCode, result.Result);
           return;
        }

        controller.SendResponse(200, result);       

    }

    private CastToExpection(err: Error): Exception {
        let ex: Exception | undefined;

        if (err instanceof Exception)
            ex = err;
        else {
            ex = new Exception(err.message);
            ex.stack = err.stack;
        }

        return ex;
    }

    private CallErrorHandler(request: Request, response: Response, exception: Error) {
        let defaultHandler = (request: Request, response: Response, exception: Exception): void => {
            try {

                response.status(500);
                response.json(exception);

            } catch (err) {
                console.log("Error while trying handle the error");
                console.log(err);

            } finally {
                console.log("Inner exception");
                console.log(exception);
            }
        }

        if (this.ApplicationThreadExeptionHandler != undefined) {
            try {
                this.ApplicationThreadExeptionHandler!(request, response, this.CastToExpection(exception));

            } catch (err) {
                console.log("Error while trying handle the error with custom delegate");
                console.log(err);
                defaultHandler(request, response, this.CastToExpection(err as Error));
            }
        } else {
            defaultHandler(request, response, this.CastToExpection(exception));
        }
    }



    public abstract ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void>;


}


