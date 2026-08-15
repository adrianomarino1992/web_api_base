import { ControllerBase, GET, Route } from "../TestAPI";

@Route("results")
export default class ResultsController extends ControllerBase
{
    @GET()
    public OkResult()
    {
        return this.OK({ status: "ok" });
    }

    @GET()
    public CreatedResult()
    {
        return this.Created({ status: "created" });
    }

    @GET()
    public AcceptedResult()
    {
        return this.Accepted({ status: "accepted" });
    }

    @GET()
    public NoContentResult()
    {
        return this.NoContent();
    }

    @GET()
    public BadRequestResult()
    {
        return this.BadRequest({ status: "bad-request" });
    }

    @GET()
    public UnauthorizedResult()
    {
        return this.Unauthorized({ status: "unauthorized" });
    }

    @GET()
    public ForbiddenResult()
    {
        return this.Forbidden({ status: "forbidden" });
    }

    @GET()
    public NotFoundResult()
    {
        return this.NotFound({ status: "not-found" });
    }

    @GET()
    public ErrorResult()
    {
        return this.Error({ status: "error" });
    }

    @GET()
    public ThrowException()
    {
        throw new Error("Boom");
    }
}
