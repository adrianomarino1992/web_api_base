import GenericResult from "./GenericResult";



export default class OKResult<T> extends GenericResult<T>
{
    constructor(result?: T) {
        super(200, result);
    }
}
