import GenericResult from "./GenericResult";



export default class AcceptedResult<T> extends GenericResult<T>
{
    constructor(result?: T) {
        super(202, result);
    }
}
