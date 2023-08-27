import { Express, Request, Response } from "express";
import IApplicationConfiguration from './IApplicationConfiguration';
import Exception from "../exceptions/Exception";

export default interface IApplication
{
    Express : Express;

    ApplicationErrorHandler? : ApplicationExceptionHandler;

    StartAsync() : Promise<void>;    

    ConfigureAsync (appConfig : IApplicationConfiguration): Promise<void>;
}

export interface ApplicationExceptionHandler
{
    (request : Request, response : Response, exception : Exception) : void;
}