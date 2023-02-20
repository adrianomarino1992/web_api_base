import { Express } from "express";
import ExpressModule from "express";
import ApplicationConfiguration from "./ApplicationConfiguration"
import IApplication from "./interfaces/IApplication";
import IApplicationConfiguration from "./interfaces/IApplicationConfiguration";

export default abstract class Application implements IApplication
{

    private ApplicationConfiguration : IApplicationConfiguration;

    public Express : Express;


    constructor()
    {
        this.ApplicationConfiguration = new ApplicationConfiguration();

        this.Express = ExpressModule();

    }
    

    public async StartAsync() : Promise<void>
    {
        await this.ApplicationConfiguration.StartAsync();

        this.Express.use(ExpressModule.json({limit : 50 * 1024 * 1024}));    

        this.Configure(this.ApplicationConfiguration);

        this.Express.listen(this.ApplicationConfiguration.Port, this.ApplicationConfiguration.Host, ()=>
        {
            console.log(`App running on ${this.ApplicationConfiguration.Host}:${this.ApplicationConfiguration.Port}`);
        })
    }

    public UseCors() : void 
    {
        this.Express.use(require('cors')());
    }


    public abstract Configure(appConfig : IApplicationConfiguration): void;
    
    
}