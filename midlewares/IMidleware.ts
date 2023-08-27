import { Request, Response } from "express";

export default interface IMidleware
{
    (context : IHTTPRequestContext) : void;
    
}

export interface IRequestResultHandler
{
    (result : IRequestResult) : void;
    
}

export interface IHTTPRequestContext
{
    Request : Request;
    Response : Response;
    Next : () => void;
}

export interface IRequestResult
{
    Exception? : Error, 
    Result? : any, 
    Request : Request, 
    Response : Response
}