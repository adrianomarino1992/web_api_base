import GenericResult from "./GenericResult";



export default class UnauthorizedResult<T> extends GenericResult<T>
{
    constructor(result?: T) {
        super(401, result);
    }
}
