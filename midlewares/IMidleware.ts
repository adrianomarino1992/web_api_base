import { Request, Response } from "express";
import Exception from "../exceptions/Exception";

export default interface IMidleware
{
    (context : IHTTPRequestContext) : Promise<void>;
    
}

export interface IRequestResultHandler
{
    (result : IRequestResult) : Promise<void>;
    
}

export interface IHTTPRequestContext
{
    Request : Request;
    Response : Response;
    Next : () => Promise<void>;
}

export interface IRequestResult
{
    Exception? : Exception, 
    Result? : any, 
    Request : Request, 
    Response : Response
}