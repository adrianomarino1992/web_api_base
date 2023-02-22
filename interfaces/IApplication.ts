import { Express } from "express";
import IApplicationConfiguration from './IApplicationConfiguration';

import IController from "./IController";

export default interface IApplication
{
    Express : Express;

    StartAsync() : Promise<void>;    

    ConfigureAsync (appConfig : IApplicationConfiguration): Promise<void>;
}