import { Express } from "express";
import ExpressModule from "express";
import ApplicationConfiguration from "./ApplicationConfiguration"
import IApplication from "./interfaces/IApplication";
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

export default abstract class Application implements IApplication
{

    private ApplicationConfiguration : IApplicationConfiguration;

    public Express : Express;


    constructor()
    {
        this.ApplicationConfiguration = new ApplicationConfiguration();

        this.Express = ExpressModule();

    }
    

    public async StartAsync() : Promise<void>
    {
        await (this.ApplicationConfiguration as ApplicationConfiguration).StartAsync();

        this.Express.use(ExpressModule.json({limit : 50 * 1024 * 1024}));    

        await this.ConfigureAsync(this.ApplicationConfiguration);

        this.Express.listen(this.ApplicationConfiguration.Port, this.ApplicationConfiguration.Host, ()=>
        {
            console.log(`App running on ${this.ApplicationConfiguration.Host}:${this.ApplicationConfiguration.Port}`);
        })
    }

    public UseCors() : void 
    {
        this.Express.use(require('cors')());
    }

    protected UseControllers(root? : string) : Promise<void>
    {
        return new Promise<void>(async (resolve, reject) =>
        {

            let controllersPath : string = Path.join(root ?? this.ApplicationConfiguration.RootPath, "controllers");

            console.debug(`reading controllers in ${controllersPath}`);

            if(!File.existsSync(controllersPath))
                return;  

            let files : string[] = File.readdirSync(controllersPath).filter(s => s.toLocaleLowerCase().endsWith("controller.js"));

            for(let controllerFile of files)
            {
                try{

                let controllerClass = await import(Path.join(controllersPath, controllerFile));

                let controller = Reflect.construct(controllerClass.default.prototype.constructor, []) as IController;

                if(controller != undefined && controller != null)
                {
                    this.AppendController(controllerClass.default.prototype.constructor);
                }

                }catch{}
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

                            if(!f.Field)
                                obj =request.body;
                            else 
                               obj = request.body[f.Field];                            
                            
                            if(["string", "number", "boolean", "bigint"].filter(s => s == ts[f.Index].name.toLocaleLowerCase()).length == 0){
                                try{
                                    obj.__proto__ = ts[f.Index];
                                }catch{}
                            
                                let t = Reflect.construct(ts[f.Index], []) as any;
                                Object.assign(t, obj);

                                fromBodyParams.push(t);
                                params.push(t);
                            }else
                            {
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
                        fromQuery.sort((a, b) => a.Index - b.Index).forEach(f => 
                        {                 
                            let obj : string | undefined;

                            if(!f.Field){

                                let keys = Object.keys(request.query);

                                if(keys.length > 0){

                                    obj = request.query[keys[0]]?.toString();                                   
                                }
                            }
                            else {

                                obj = request.query[f.Field]?.toString();
                                                              
                            }

                            if(obj && ts[f.Index].name.toLocaleLowerCase() == "number")
                            {
                                let number = Number.parseFloat(obj.toString());

                                if(number != Number.NaN){
                                    fromQueryParams.push(number);
                                    params.push(number);
                                }

                            }else if(obj && ts[f.Index].name.toLocaleLowerCase() == "string")
                            {
                                fromBodyParams.push(obj.toString());
                                params.push(obj.toString());
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

                            if(fromBody.length  > fromBodyParams.filter(s => s != undefined).length)
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
                    
                    DependecyService.CheckForDependenciesAndResolve(controller);                    

                    controller.Request = context.Request;
                    controller.Response = context.Response;
                    (controller as any)[method](...params);
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


    public abstract ConfigureAsync(appConfig : IApplicationConfiguration): Promise<void>;
    
    
}