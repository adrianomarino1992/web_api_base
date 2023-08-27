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
    
    public OK<T>(result? : T) : T | undefined
    {
        return this.SendResponse<T>(200,result);
    }

    public Created<T>(result? : T) : T | undefined
    {
        return this.SendResponse<T>(201,result);
    }

    public Accepted<T>(result? : T) : T | undefined
    {
        return this.SendResponse<T>(202,result);
    }

    public NoContent<T>(result? : T) : T | undefined
    {
        return this.SendResponse<T>(204,result);
    }    
    
    public BadRequest<T>(result? : T) : T | undefined
    {
        return this.SendResponse<T>(400,result);
    }

    public Unauthorized<T>(result? : T) : T | undefined
    {
        return this.SendResponse<T>(401,result);
    }

    public Forbidden<T>(result? : T) : T | undefined
    {
        return this.SendResponse<T>(403,result);
    }

    public NotFound<T>(result? : T) : T | undefined
    {
        return this.SendResponse<T>(404,result);
    }

    public Error<T>(result? : T) : T | undefined
    {
        return this.SendResponse<T>(500,result);
    }

    public SendResponse<T>(status : number, result? : T) : T | undefined
    {
        this.Response.status(status);

        if(result)
            this.Response.json(result);
        else
            this.Response.end();
        
        return result;
    }
    
}