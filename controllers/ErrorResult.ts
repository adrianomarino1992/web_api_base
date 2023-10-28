import GenericResult from "./GenericResult";



export default class ErrorResult<T> extends GenericResult<T>
{
    constructor(result?: T) {
        super(500, result);
    }
}
