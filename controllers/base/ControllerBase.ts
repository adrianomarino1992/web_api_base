import IController from "../../interfaces/IController";
import {Request, Response} from 'express'
import ControllersDecorators from '../../decorators/controllers/ControllerDecorators';
import DependecyService from '../../dependencyInjection/DependecyService';
import IApplication from "../../interfaces/IApplication";
import { HTTPVerbs } from "../../enums/httpVerbs/HttpVerbs";


export class ControllerBase implements IController
{
    Request : Request = {} as Request;
    Response : Response = {} as Response;

    constructor()
    {
        
    }

    public OK<T>(result : T)
    {
        this.Response.status(200);
        this.Response.json(result);
    }

    public Created()
    {
        this.Response.status(201);
        this.Response.end();
    }
    
    public BadRequest<T>(result : T)
    {
        this.Response.status(400);
        this.Response.json(result);
    }

    public Error<T>(result : T)
    {
        this.Response.status(500);
        this.Response.json(result);
    }

    public SendResponse<T>(status : number, result : T)
    {
        this.Response.status(status);
        this.Response.json(result);
    }

    public static AppendController<T extends IController>(ctor : { new (...args : any[]) : T;}, application : IApplication) : void
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

            (application.Express as any)[verb.toString().toLowerCase()](`${route}${action}`, (req : Request, resp : Response) => 
            {

                let midlewares = ControllersDecorators.GetMidlewares(empty).reverse();

                midlewares.push(...ControllersDecorators.GetBefores(empty, method.toString()).reverse());

                if(midlewares)
                {
                    for(let method of midlewares)
                    {
                        method(req);
                    }
                }

                let args = ControllersDecorators.GetArgumentsHandler(empty, method.toString());
                let params = [];
                
                if(args)
                {
                    if(args.Arguments.length > 0)
                    {
                        if(req.body && verb == (HTTPVerbs.POST || verb == HTTPVerbs.PUT))
                            params = args.CreateArgumentsList(req.body);
                        if(req.query)
                            params.push(...args.CreateArgumentsList(req.query))
                    }
                }

                let controller = DependecyService.ResolveCtor(empty.constructor) as IController;
                controller.Request = req;
                controller.Response = resp;
                (controller as any)[method](...params);
            })
        }
                
    }
}