export default class ActionResult
{
    public StatusCode : number;
    public Result? : any;
    
    constructor(status: number, result? : any)
    {
        this.Result = result;
        this.StatusCode = status;
    }
}

