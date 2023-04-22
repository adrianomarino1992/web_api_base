import { ControllerTest } from "./classes/ControllerTest";
import ControllersDecorators from "../decorators/controllers/ControllerDecorators";
import { HTTPVerbs } from "../enums/httpVerbs/HttpVerbs";
import { SampleService } from "./classes/SampleServiceTest";

describe('testing controllers decorators', ()=>
{

    test("action name", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        let action = ControllersDecorators.GetAction(controller, "TestAction");
        expect(action).toBe("/test");

    },10^5)

    test("http verb", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        let verb = ControllersDecorators.GetVerb(controller, "TestAction");
        expect(verb).toBe(HTTPVerbs.GET);

    },10^5)

    test("action with one arg", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        
        var handler = ControllersDecorators.GetArgumentsHandler(controller, 'TestAction');

        var arr = handler?.CreateArgumentsList({name : "adriano"});

        Reflect.apply(controller.TestAction, controller, arr ?? []);

        expect(arr).not.toBeNull();


    },10^5)


    test("action with two args", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        
        var handler = ControllersDecorators.GetArgumentsHandler(controller, 'TestActionTwo');

        var arr = handler?.CreateArgumentsList({name : "adriano", age : 30});

        Reflect.apply(controller.TestActionTwo, controller, arr ?? []);

        expect(arr).not.toBeNull();


    },10^5)


    test("controller route", ()=>
    {
        var controller = new ControllerTest(new SampleService());
        
        var route = ControllersDecorators.GetRoute(controller);
        
        expect(route!).toBe("/test");


    },10^5)

})