import GenericResult from "./GenericResult";



export default class NoContentResult<T> extends GenericResult<T>
{
    constructor(result?: T) {
        super(204, result);
    }
}
