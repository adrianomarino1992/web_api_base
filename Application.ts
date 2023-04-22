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
import { HTTPRequestContext } from "./midlewares/IMidleware";

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

        if(!route)
            return;


        for(let method of methods)
        {
            let action = ControllersDecorators.GetAction(empty, method.toString());

            if(!action){
                continue;                
            }
            
            let verb = ControllersDecorators.GetVerb(empty, method.toString());

            if(!verb)
                verb = HTTPVerbs.GET;

            console.debug("appended : " , verb,`${route}${action}`);

            (this.Express as any)[verb.toString().toLowerCase()](`${route}${action}`, (request : Request, response : Response) => 
            {

                let midlewares = ControllersDecorators.GetMidlewares(empty).reverse();

                midlewares.push(...ControllersDecorators.GetBefores(empty, method.toString()).reverse());

                let handler = (context : HTTPRequestContext) => 
                {
                    let args = ControllersDecorators.GetArgumentsHandler(empty, method.toString());
                    let params = [];
                    
                    if(args)
                    {
                        if(args.Arguments.length > 0)
                        {
                            if(context.Request.body && verb == (HTTPVerbs.POST || verb == HTTPVerbs.PUT))
                                params = args.CreateArgumentsList(context.Request.body);
                            if(context.Request.query)
                                params.push(...args.CreateArgumentsList(context.Request.query))
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
                    
                    let httpRequestContexts : HTTPRequestContext[] = [];

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