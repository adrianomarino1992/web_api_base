import IDIContext, { IDIItem } from "../../dependencyInjection/IDIContext";
import IController from "../../interfaces/IController";
import {Request, Response} from 'express';
import AcceptedResult from "../AcceptedResult";
import BadRequestResult from "../BadRequestResult";
import CreatedResult from "../CreatedResult";
import ErrorResult from "../ErrorResult";
import ForbiddenResult from "../ForbiddenResult";
import NoContentResult from "../NoContentResult";
import NotFoundResult from "../NotFoundResult";
import OKResult from "../OKResult";
import UnauthorizedResult from "../UnauthorizedResult";
import SendFileResult from "../SendFileResult";
import DownloadFileResult from "../DownloadFileResult";
import File from 'fs';
import FileNotFoundException from "../../exceptions/FileNotFoundException";
import ArgumentNullException from "../../exceptions/ArgumentNullException";
import Type from "../../metadata/Type";


export class ControllerBase implements IController, IDIContext
{
    Request : Request = {} as Request;
    Response : Response = {} as Response;
    Intances: IDIItem[] = [];

    constructor()
    {
        
    }   
    
    public OK<T>(result? : T) : OKResult<T>
    {
        return new OKResult(result);
    }

    public Created<T>(result? : T) : CreatedResult<T>
    {
        return new CreatedResult(result);
    }

    public Accepted<T>(result? : T) : AcceptedResult<T>
    {
        return new AcceptedResult(result);
    }

    public NoContent<T>(result? : T) : NoContentResult<T>
    {
        return new NoContentResult(result);
    }    

    public SendFile(path : string) : SendFileResult<string>
    {
        if(!path)
            throw new ArgumentNullException(`The path of the file is required on a SendFile response`);

        if(!File.existsSync(path))
            throw new FileNotFoundException(`can not access the file: ${path}`);

        return new SendFileResult(path);
    }

    public DownloadFile(path : string) : DownloadFileResult<string>
    {
        if(!path)
            throw new ArgumentNullException(`The path of the file is required on a DownloadFile response`);

        if(!File.existsSync(path))
            throw new FileNotFoundException(`can not access the file: ${path}`);

        return new DownloadFileResult(path);
    }
    
    public BadRequest<T>(result? : T) : BadRequestResult<T>
    {
        return new BadRequestResult(result);
    }

    public Unauthorized<T>(result? : T) : UnauthorizedResult<T>
    {
        return new UnauthorizedResult(result);
    }

    public Forbidden<T>(result? : T) : ForbiddenResult<T>
    {
        return new ForbiddenResult(result);
    }

    public NotFound<T>(result? : T) : NotFoundResult<T>
    {
        return new NotFoundResult(result);
    }

    public Error<T>(result? : T) : ErrorResult<T>
    {
        return new ErrorResult(result);
    }

    public SendResponse<T>(status : number, result? : T) : T | undefined
    {
        this.Response.status(status);

        if(result){
            if(typeof result == "object")
            {
                try{
                    this.Response.json(Type.RemoveCircularReferences(result));
                }catch{
                    this.Response.json(result);
                }
            }
            else if(typeof result == "number")
                this.Response.send(result.toString());
            else
                this.Response.send(result);
        }
        else
            this.Response.end();
        
        return result;
    }
    
}