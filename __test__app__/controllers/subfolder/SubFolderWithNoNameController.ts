import ActionResult from "../../../controllers/ActionResult";
import { ControllerBase } from "../../../controllers/base/ControllerBase";
import { Route, GET, FromPath, OmmitActionNameOnRoute, OmmitOnRoute } from "../../../";






@Route("v1/[folder]/cards")
export default class SubFolderWithNoNameController extends ControllerBase {

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
