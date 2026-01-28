import { ControllerBase, FileService, Route, Inject, InjectAbstract, UseBefore,  FromBody, DELETE, FromQuery, GET, POST, PUT, Description, ProducesResponse, ActionResult, FromFiles, ControllerHeader, ActionHeader,  UseAfter, InjectForTypeArgument, Validate, FromPath } from "../../index";
import { ConcreteService, SampleService, SampleServiceAbstract, WithGenericType } from "../service/SampleService";
import {File} from '../../index';
import Path from 'path';
import GenericService from '../../__tests__/classes/GenericService';

export default class ToIgnoreFakeController
{
    
    @GET()   
    public Ping(@FromPath()paRam : string) {
       console.log({ status: "pong", paRam });
    }
        
}