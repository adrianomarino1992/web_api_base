
import { ControllerBase, Route, Verb, Action, HTTPVerbs as verbs, Inject, InjectAbstract, Use } from "web_api_base";


@Route()
export default class adrianoController extends ControllerBase
{ 
     
    constructor()
    {
        super();              
    }
    
    @Action()
    public Ping() : void
    {       
        this.OK({status : "pong"});
    }
    
}