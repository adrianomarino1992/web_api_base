import { ControllerTest } from "./classes/ControllerTest";
import ControllersDecorators from "../decorators/controllers/ControllerDecorators";
import { HTTPVerbs } from "../enums/httpVerbs/HttpVerbs";
import { SampleService } from "./classes/SampleServiceTest";
import ValidationDecorators from "../decorators/validations/ValidationDecorators";

describe('Testing controllers decorators', ()=>
{

    test("Testing get action value", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        let action = ControllersDecorators.GetAction(controller, "TestAction");
        expect(action).toBe("/test");

    });

    test("Testing GET decotarator", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        let verb = ControllersDecorators.GetVerb(controller, "TestAction");
        expect(verb).toBe(HTTPVerbs.GET);

    });

    test("Testing POST decorator", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        let verb = ControllersDecorators.GetVerb(controller, "PostAction");
        expect(verb).toBe(HTTPVerbs.POST);

    });

    test("Testing PUT decorator", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        let verb = ControllersDecorators.GetVerb(controller, "PutAction");
        expect(verb).toBe(HTTPVerbs.PUT);

    });

    test("Testing DELETE decorator", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        let verb = ControllersDecorators.GetVerb(controller, "DeleteAction");
        expect(verb).toBe(HTTPVerbs.DELETE);

    });
    

    test("Testing FromQuery decorator", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        let fromBody = ControllersDecorators.GetFromBodyArgs(controller.constructor, "TestActionTwo");
        let fromQuery = ControllersDecorators.GetFromQueryArgs(controller.constructor, "TestActionTwo");
        expect(fromBody.length).toBe(0);
        expect(fromQuery.length).toBe(2);
        fromQuery = ControllersDecorators.GetFromQueryArgs(controller.constructor, "TestAction");
        expect(fromQuery.length).toBe(1);

    });

    test("Testing FromBody decorator", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        let fromBody = ControllersDecorators.GetFromBodyArgs(controller.constructor, "PostAction");
        let fromQuery = ControllersDecorators.GetFromQueryArgs(controller.constructor, "PostAction");
        expect(fromBody.length).toBe(1);
        expect(fromQuery.length).toBe(0);

    });

    test("Testing controller route decorator", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        
        var route = ControllersDecorators.GetRoute(controller);
        
        expect(route!).toBe("/test");

    });

})