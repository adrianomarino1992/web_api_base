import IController from "../../interfaces/IController";
import {Request, Response} from 'express';


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
    
}