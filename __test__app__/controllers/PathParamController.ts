import { FromPath } from "../..";
import { OmmitActionNameOnRoute } from "../..";
import { Route, GET, ProducesResponse } from "../..";
import ActionResult from "../../controllers/ActionResult";
import { ControllerBase } from "../../controllers/base/ControllerBase";



@Route(':paRam/path')
export default class PathParamController extends ControllerBase {

    constructor() {
        super();
    }

    @GET()   
    public Ping(@FromPath()paRam : string): ActionResult {
        return this.OK({ status: "pong", paRam });
    }

    @GET() 
    @OmmitActionNameOnRoute()
    public WithNoName(@FromPath()paRam : string): ActionResult {
        return this.OK({ status: "pong", paRam });
    }
    
    @GET()    
    public async GetAtoAsync(@FromPath()paRam: string, @FromPath('cod_param')codigoParam: string): Promise<ActionResult> 
    {
        return this.OK({paRam, codigoParam });
    }

}




