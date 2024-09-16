import GenericResult from "./GenericResult";

export default class SendFileResult<T> extends GenericResult<T> {
    constructor(result?: T) {
        super(200, result);
    }
}



