import { Express, Request, Response } from "express";
import IApplicationConfiguration from './IApplicationConfiguration';
import Exception from "../exceptions/Exception";

export default interface IApplication
{
    Express : Express;

    ApplicationThreadExeptionHandler? : ApplicationExceptionHandler;

    ApplicationRouteNotFoundHandler? : ApplicationRouteNotFoundHandler;

    StartAsync() : Promise<void>;    

    ConfigureAsync (appConfig : IApplicationConfiguration): Promise<void>;

    CreateDocumentation() : void;
}

export interface ApplicationExceptionHandler
{
    (request : Request, response : Response, exception : Exception) : void;
}

export interface ApplicationRouteNotFoundHandler
{
    (request : Request, response : Response) : void;
}


export { Express as ExpressApp} from 'express'; 