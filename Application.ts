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

export default abstract class Application implements IApplication
{

    public static Configurations : IApplicationConfiguration;

    private _createdControllers : { new (...args : any[]) : IController} [] = [];

    public ApplicationConfiguration : IApplicationConfiguration;
    
    public Express : Express;

    public ApplicationThreadExeptionHandler?: ApplicationExceptionHandler;

    constructor()
    {
        this.ApplicationConfiguration = new ApplicationConfiguration();

        this.Express = ExpressModule();       

    }
    
 
    public async StartAsync() : Promise<void>
    {
        await (this.ApplicationConfiguration as ApplicationConfiguration).LoadAsync();

        Application.Configurations =  this.ApplicationConfiguration;

        this.Express.use(ExpressModule.json({limit : 50 * 1024 * 1024}));    

        await this.ConfigureAsync(this.ApplicationConfiguration);        

        await (this.ApplicationConfiguration as ApplicationConfiguration).SaveAsync();             

        this.Express.listen(this.ApplicationConfiguration.Port, this.ApplicationConfiguration.Host, ()=>
        {
            console.log(`Application running on ${this.ApplicationConfiguration.Host}:${this.ApplicationConfiguration.Port}`);
        });
    }

    public UseCors() : void 
    {
        this.Express.use(require('cors')());
    }

    private GetIgnoredPaths() : string[]
    {
        return [
            ".git",
            ".vscode",
            "coverage",             
            "node_modules"
        ]
    }

    private TryFindControllerFolder(path : string) : string | undefined
    {

        if(this.GetIgnoredPaths().filter(s => path.endsWith(s)).length > 0)
            return undefined;

        if(path.indexOf("node_modules") > -1)
            return undefined;
       
        if(!File.existsSync(path))
            return undefined;
        
        if(File.readdirSync(path).filter(s => s.toLowerCase().endsWith("controller.js")).length > 0)
            return path;
        
        let folder = File.readdirSync(path).filter(s => !File.lstatSync(Path.join(path, s)).isFile());

        if(folder.length == 0)
            return undefined;
            
        for(let f of folder)
        {
            let find = this.TryFindControllerFolder(Path.join(path, f));

            if(find && find.toLowerCase().endsWith("controllers"))
                return find;                
    
        }

        return undefined;
    }

    

    protected UseControllersAsync(root? : string) : Promise<void>
    {
        return new Promise<void>(async (resolve, reject) =>
        {
            
            let controllersPath : string | undefined = this.TryFindControllerFolder(Path.join(root ?? this.ApplicationConfiguration.RootPath, "controllers"));

            if(!controllersPath)
                controllersPath = this.TryFindControllerFolder(root ?? this.ApplicationConfiguration.RootPath);
           
            if(!controllersPath || !File.existsSync(controllersPath!))
                return;  

            console.debug(`reading controllers in ${controllersPath}`);

            let files : string[] = File.readdirSync(controllersPath).filter(s => s.toLocaleLowerCase().endsWith("controller.js"));

            for(let controllerFile of files)
            {
                

                let controllerModule = await import(Path.join(controllersPath, controllerFile));

                let controllerClass : any | undefined = undefined;

                if(controllerModule.default == undefined)
                {

                    for(let c in controllerModule)
                    {
                        if(c.toLocaleLowerCase().endsWith("controller"))
                        {
                            controllerClass = controllerModule[c];
                        }
                    }

                }else 
                    controllerClass = controllerModule.default;

                if(controllerClass == undefined)
                    throw new ControllerLoadException(`Can find any controller from file : ${controllerFile}`);

                let controller = Reflect.construct(controllerClass.prototype.constructor, []) as IController;

                if(controller != undefined && controller != null)
                {
                    this.AppendController(controllerClass.prototype.constructor);

                }else{

                    throw new ControllerLoadException(`Can not load ${controllerClass.name} controller from file : ${controllerFile}`);
                }

                
            }

            resolve();


        })
        

    }

    
    protected AppendController<T extends IController>(ctor : { new (...args : any[]) : T;}) : void
    {
        let empty = new ctor() as any;
                
        let methods = Reflect.ownKeys(empty.constructor.prototype).filter(m => 
            {
                return typeof empty[m] == "function" ;
            })     

        let route = ControllersDecorators.GetRoute(empty);
        let validateBody = ControllersDecorators.IsToValidate(empty);

        if(!route)
            return;

        this._createdControllers.push(ctor);

        for(let method of methods)
        {
            let action = ControllersDecorators.GetAction(empty, method.toString());

            if(!action){
                continue;                
            }
            
            let verb = ControllersDecorators.GetVerb(empty, method.toString());
            let fromBody = ControllersDecorators.GetFromBodyArgs(empty.constructor, method.toString());
            let fromQuery = ControllersDecorators.GetFromQueryArgs(empty.constructor, method.toString());

            if(!verb)
                verb = HTTPVerbs.GET;

            console.debug("appended : " , verb,`${route}${action}`);

            (this.Express as any)[verb.toString().toLowerCase()](`${route}${action}`, (request : Request, response : Response) => 
            {

                let midlewares = ControllersDecorators.GetMidlewares(empty).reverse();

                midlewares.push(...ControllersDecorators.GetBefores(empty, method.toString()).reverse());


                let afters = ControllersDecorators.GetMidlewaresAfter(empty).reverse();

                afters.push(...ControllersDecorators.GetAfters(empty, method.toString()).reverse());

                let handler = (context : IHTTPRequestContext) => 
                {
                    
                    let params : any[]= [];
                    
                    let ts = Reflect.getMetadata("design:paramtypes", empty, method.toString()) ?? 
                             Reflect.getMetadata("design:paramtypes", empty.constructor, method.toString());

                    let fromBodyParams: any[] = [];
                    if(fromBody.length > 0)
                    { 
                        fromBody.sort((a, b) => a.Index - b.Index).forEach(f => 
                        {
                            let obj = undefined;

                            if(!f.Field || f.Type.name == "Object")
                                obj =request.body;
                            else 
                               obj = request.body[f.Field];                            
                            
                            if(["string", "number", "boolean", "bigint"].filter(s => s == ts[f.Index].name.toLocaleLowerCase()).length == 0){
                                try{
                                    obj.__proto__ = ts[f.Index];
                                }catch{}
                            
                                if(f.Type.name == "Object")
                                {
                                    fromBodyParams.push(obj);
                                    params.push(obj);

                                }else{

                                    let t = Reflect.construct(ts[f.Index], []) as any;
                                    Object.assign(t, obj);                               

                                    fromBodyParams.push(t);
                                    params.push(t);
                                }
                            }else
                            {
                                if(obj && obj.indexOf('"') == 0 && obj.lastIndexOf('"') == obj.length -1)
                                    obj = obj.substring(1, obj.length -1);

                                if(obj && ts[f.Index].name.toLocaleLowerCase() == "number")
                                {
                                    let number = Number.parseFloat(obj.toString());

                                    if(number != Number.NaN){
                                        fromBodyParams.push(number);
                                        params.push(number);
                                    }

                                }else if(obj && ts[f.Index].name.toLocaleLowerCase() == "string")
                                {
                                    fromBodyParams.push(obj.toString());
                                    params.push(obj.toString());
                                }
                                else if(obj && ts[f.Index].name.toLocaleLowerCase() == "date")
                                {
                                    try{

                                        fromBodyParams.push(new Date(obj));
                                        params.push(new Date(obj));

                                    }catch{}                                
                                }
                                else
                                {
                                    fromBodyParams.push(obj);
                                    params.push(obj);
                                }
                            }
                        });
                    }

                    let fromQueryParams : any[] = [];
                    if(fromQuery.length > 0)
                    {   
                        fromQuery.sort((a, b) => a.Index - b.Index).forEach((f, j) => 
                        {                 
                            let obj : string | undefined;

                            obj = request.query[f.Field]?.toString();   

                            if(obj && obj.indexOf('"') == 0 && obj.lastIndexOf('"') == obj.length -1)
                                    obj = obj.substring(1, obj.length -1);

                            if(obj && f.Type.name.toLocaleLowerCase() == "number")
                            {
                                let number = Number.parseFloat(obj.toString());

                                if(number != Number.NaN){
                                    fromQueryParams.push(number);
                                    params.push(number);
                                }

                            }else if(obj && f.Type.name.toLocaleLowerCase() == "string")
                            {                              
                                fromQueryParams.push(obj.toString());
                                params.push(obj.toString());
                            }
                            else if(obj && f.Type.name.toLocaleLowerCase() == "date")
                            {
                                try{

                                    fromQueryParams.push(new Date(obj));
                                    params.push(new Date(obj));

                                }catch{}
                                
                            }
                            else
                            {
                                fromQueryParams.push(obj);
                                params.push(obj);
                            }
                        });
                    }
                   
                    if(params.length > 0)
                    {
                        if(validateBody){
                            let erros : string[] = [];

                            if(fromBody.length  > fromBodyParams.filter(s => s != undefined).length || (fromBody.length > 0 && request.headers["content-length"] == '0'))
                            {
                                response.status(400);
                                response.json(
                                    {
                                        Message : "Model binding fail", 
                                        Detailts : [ "Some expected body parameter was not provided" ]
                                    });
                                return;
                            }

                            if(fromQuery.length  > fromQueryParams.filter(s => s != undefined).length)
                            {
                                response.status(400);
                                response.json(
                                    {
                                        Message : "Model binding fail", 
                                        Detailts : [ "Some expected url query string parameter was not provided" ]
                                    });
                                return;
                            }

                            for(let a of fromBodyParams)
                            {
                                erros.push(...ValidationDecorators.Validate<typeof a>(a).map(s => s.Message));
                            }

                            if(erros.length > 0)
                            {
                                response.status(400);
                                response.json(
                                    {
                                        Message : "Validation fail", 
                                        Detailts : erros
                                    });
                                return;
                            }
                        }
                    }
    
                    let controller = DependecyService.ResolveCtor(empty.constructor) as IController;

                    if(controller == undefined)
                        controller = new ctor() as IController;
                    
                    try{

                        DependecyService.CheckForDependenciesAndResolve(controller);  

                    }catch(err)
                    {
                        this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                    }               

                    controller.Request = context.Request;
                    controller.Response = context.Response;

                    try{
                        
                        let exceutionTask = (controller as any)[method](...params);
                        
                        if(exceutionTask instanceof Promise)
                        {
                            exceutionTask.then(c => 
                                {
                                    for(let afterHandler of afters)
                                    {
                                        afterHandler(
                                            {                                   
                                                Request : request, 
                                                Response : response, 
                                                Result : exceutionTask
                                            });
                                    }
                                }).catch(err => 
                                    {
                                        for(let afterHandler of afters)
                                        {
                                            
                                            afterHandler(
                                                {                      
                                                    Exception: this.CastToExpection(err as Error),             
                                                    Request : request, 
                                                    Response : response
                                                });
                                        }

                                        if(afters.length == 0)                                        
                                            this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                                        

                                    });

                        }
                        else
                        {

                            for(let afterHandler of afters)
                            {
                                try{
                                    afterHandler(
                                    {                                   
                                        Request : request, 
                                        Response : response, 
                                        Result : exceutionTask
                                    });
                                }catch(err)
                                {
                                    this.CallErrorHandler(request, response, this.CastToExpection(err as Error))
                                }
                            }
                        }

                        

                    }
                    catch(err)
                    {
                        for(let afterHandler of afters)
                        {
                            try{                               
                                
                                afterHandler(
                                {
                                    Exception : this.CastToExpection(err as Error), 
                                    Request : request, 
                                    Response : response
                                });

                            }catch(err)
                            {
                                this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                            }
                        }

                        if(afters.length == 0)
                            this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                    }
                }

                if(midlewares && midlewares.length > 0)
                {
                    
                    let httpRequestContexts : IHTTPRequestContext[] = [];

                    let pipeline : any[] = [];

                    for(let i = 0; i <= midlewares.length; i++)
                    {

                        httpRequestContexts.push(
                            {
                                Request : request, 
                                Response : response, 
                                Next : ()=> {}
                            });
                        
                    }

                    for(let i = 0; i < httpRequestContexts.length; i++)
                    {
                        let box =
                        {
                            v : i
                        };
                        
                        
                        pipeline.push(
                            {
                                Execute : () => {

                                    pipeline.length - 1  == box.v ? handler(httpRequestContexts[box.v]) : midlewares[box.v](httpRequestContexts[box.v])
                                
                                }                                
                            });
                    }

                    for(let i = 0; i < pipeline.length; i++)
                    {
                        httpRequestContexts[i].Next = i == pipeline.length - 1 ? ()=>{} : () => pipeline[i + 1].Execute(); 
                    }  
                                        

                    pipeline[0].Execute();
                }
                else{
                   
                    handler({
                        Request : request, 
                        Response : response, 
                        Next : () => {}
                    });
                    
                }

                
            })
        }
                
    }

    public CreateDocumentation(): void {        
        new Documentation().CreateDocumentation(this._createdControllers, this.Express);
    }
    
    private CastToExpection(err : Error) : Exception
    {
        let ex : Exception | undefined;

        if(err instanceof Exception)
            ex = err;
        else 
        {
            ex = new Exception(err.message);
            ex.stack = err.stack;
        }

        return ex;
    }

    private CallErrorHandler(request : Request, response : Response, exception : Error)
    {
        let defaultHandler = (request : Request, response : Response, exception : Exception) : void =>
        {
            try{

                response.status(500);
                response.json(exception);

            }catch(err)
            {
                console.log("Error while trying handle the error");
                console.log(err);
               
            }finally
            {
                console.log("Inner exception");
                console.log(exception);
            }
        }

        if(this.ApplicationThreadExeptionHandler != undefined)
        {
            try{
                this.ApplicationThreadExeptionHandler!(request, response, this.CastToExpection(exception));

            }catch(err)
            {
                console.log("Error while trying handle the error with custom delegate");
                console.log(err);                
                defaultHandler(request, response,  this.CastToExpection(err as Error));
            }
        }else
        {
            defaultHandler(request, response,  this.CastToExpection(exception));
        }
    }



    public abstract ConfigureAsync(appConfig : IApplicationConfiguration): Promise<void>;
    
    
}


