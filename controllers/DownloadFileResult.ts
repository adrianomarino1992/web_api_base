import GenericResult from "./GenericResult";

export default class DownloadFileResult<T> extends GenericResult<T> {
    constructor(result?: T) {
        super(200, result);
    }
}
