export default interface IApplicationConfiguration
{
    Host : string;    
    Port : number;
    RootPath : string;
    StartAsync() : Promise<void>
}