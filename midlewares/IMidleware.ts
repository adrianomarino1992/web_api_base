import { Request, Response } from "express";

export default interface IMidleware
{
    (context : IHTTPRequestContext) : void;
    
}

export interface IHTTPRequestContext
{
    Request : Request;
    Response : Response;
    Next : (context : IHTTPRequestContext) => void;
}