import { ActionResult, ControllerBase, GET, ProducesResponse, Route } from "../TestAPI";


@Route()
export default class SampleController extends ControllerBase
{ 
     
    constructor()
    {
        super();              
    }
    
    @GET()
    @ProducesResponse({ Status : 200, Description: "OK", JSON : JSON.stringify({status : "pong"}, null, 2)})
    public Ping() : ActionResult
    {       
        return this.OK({status : "pong"});
    }
    
}


