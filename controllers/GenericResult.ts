import ActionResult from "./ActionResult";

export default class GenericResult<T> extends ActionResult
{   
    public Result?: T;

    constructor(status: number, result?: T) {
        super(status, result);       
    }
}
