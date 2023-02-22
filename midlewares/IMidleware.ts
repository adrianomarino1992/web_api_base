import { Request, Response } from "express";

export default interface IMidleware
{
    (context : HTTPRequestContext) : void;
    
}

export interface HTTPRequestContext
{
    Request : Request;
    Response : Response;
    Next : (context : HTTPRequestContext) => void;
}