import IDIContext, { IDIItem } from "../../dependencyInjection/IDIContext";
import IController from "../../interfaces/IController";
import {Request, Response} from 'express';


export class ControllerBase implements IController, IDIContext
{
    Request : Request = {} as Request;
    Response : Response = {} as Response;
    Intances: IDIItem[] = [];

    constructor()
    {
        
    }   
    
    public OK<T>(result? : T)
    {
        this.Response.status(200);

        if(result)
            this.Response.json(result);
        else
            this.Response.end();
    }

    public Created()
    {
        this.Response.status(201);
        this.Response.end();
    }

    public Accepted()
    {
        this.Response.status(204);
        this.Response.end();
    }

    public NoContent()
    {
        this.Response.status(204);
        this.Response.end();
    }

    
    
    public BadRequest<T>(result? : T)
    {
        this.Response.status(400);

        if(result)
            this.Response.json(result);
        else
            this.Response.end();
    }

    public NotFound()
    {
        this.Response.status(404);
        this.Response.end();
    }


    public Error<T>(result? : T)
    {
        this.Response.status(500);
        if(result)
            this.Response.json(result);
        else
            this.Response.end();
    }

    public SendResponse<T>(status : number, result? : T)
    {
        this.Response.status(status);

        if(result)
            this.Response.json(result);
        else
            this.Response.end();
    }
    
}