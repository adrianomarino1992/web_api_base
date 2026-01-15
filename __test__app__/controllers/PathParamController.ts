import { FromPath } from "../..";
import { Route, GET, ProducesResponse } from "../..";
import ActionResult from "../../controllers/ActionResult";
import { ControllerBase } from "../../controllers/base/ControllerBase";



@Route(':param')
export default class PathParamController extends ControllerBase {

    constructor() {
        super();
    }

    @GET()
   
    public Ping(@FromPath()param : string): ActionResult {
        return this.OK({ status: "pong", param });
    }

}
