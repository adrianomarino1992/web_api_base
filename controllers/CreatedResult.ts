import GenericResult from "./GenericResult";



export default class CreatedResult<T> extends GenericResult<T>
{
    constructor(result?: T) {
        super(201, result);
    }
}
