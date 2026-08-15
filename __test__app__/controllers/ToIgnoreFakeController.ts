import { FromPath, GET } from "../TestAPI";

export default class ToIgnoreFakeController
{
    
    @GET()   
    public Ping(@FromPath()paRam : string) {
       console.log({ status: "pong", paRam });
    }
        
}
