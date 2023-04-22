import { Express } from "express";
import IApplicationConfiguration from './IApplicationConfiguration';

export default interface IApplication
{
    Express : Express;

    StartAsync() : Promise<void>;    

    ConfigureAsync (appConfig : IApplicationConfiguration): Promise<void>;
}