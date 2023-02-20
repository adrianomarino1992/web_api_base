import IApplication from "./IApplication";
import {Request, Response} from 'express'

export default interface IController
{
    Request : Request;
    Response : Response;
}
