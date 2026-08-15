import { ActionResult, ControllerBase, FromPath, GET, Route } from "../../TestAPI";



@Route("[folder]/[controller]/test")
export default class SubFolderController extends ControllerBase {

    constructor() {
        super();
    }

    @GET()
    public Ping(@FromPath() paRam: string): ActionResult {
        return this.OK({ status: "pong", paRam });
    }

    @GET()
    public WithNoName(@FromPath() paRam: string): ActionResult {
        return this.OK({ status: "pong", paRam });
    }

    @GET()
    public async GetAtoAsync(@FromPath() paRam: string, @FromPath('cod_param') codigoParam: string): Promise<ActionResult> {
        return this.OK({ paRam, codigoParam });
    }

}







