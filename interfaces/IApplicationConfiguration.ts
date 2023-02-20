export default interface IApplicationConfiguration
{
    Host : string;    
    Port : number;
    StartAsync() : Promise<void>
}