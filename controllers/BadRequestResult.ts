import GenericResult from "./GenericResult";



export default class BadRequestResult<T> extends GenericResult<T>
{
    constructor(result?: T) {
        super(400, result);
    }
}
