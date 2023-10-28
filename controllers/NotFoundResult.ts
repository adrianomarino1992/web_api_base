import GenericResult from "./GenericResult";



export default class NotFoundResult<T> extends GenericResult<T>
{
    constructor(result?: T) {
        super(404, result);
    }
}
