import { Request } from "express";

export default interface IMidleware
{
    (req : Request) : void
}