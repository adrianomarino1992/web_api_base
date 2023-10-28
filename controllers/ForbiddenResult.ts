import GenericResult from "./GenericResult";



export default class ForbiddenResult<T> extends GenericResult<T>
{
    constructor(result?: T) {
        super(403, result);
    }
}
