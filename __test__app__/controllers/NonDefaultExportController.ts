import { ActionResult, ControllerBase, FromPath, GET, LabelOnDocumentation, Route } from "../TestAPI";






export class NonDefaultExportController extends ControllerBase {

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


@LabelOnDocumentation("[route] -- [controller]")
@Route("[folder]/[controller]/nonDefaultExport")
export class NonDefaultExport2Controller extends ControllerBase {

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
