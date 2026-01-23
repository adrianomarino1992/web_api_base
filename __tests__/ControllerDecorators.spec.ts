import 'reflect-metadata';
import { ControllerTest } from "./classes/ControllerTest";
import ControllersDecorators from "../decorators/controllers/ControllerDecorators";
import { HTTPVerbs } from "../enums/httpVerbs/HttpVerbs";
import { SampleService } from "./classes/SampleServiceTest";

describe("Controller decorators", () => {

    test("should retrieve the action route value", () => {
        
        const controller = new ControllerTest(new SampleService());
        const action = ControllersDecorators.GetAction(ControllerTest, "TestAction");

        expect(action).toBe("/Test");

    });

    test("should retrieve GET HTTP verb from decorator", () => {

        const controller = new ControllerTest(new SampleService());
        const verb = ControllersDecorators.GetVerb(ControllerTest, "TestAction");

        expect(verb).toBe(HTTPVerbs.GET);

    });

    test("should retrieve POST HTTP verb from decorator", () => {

        const controller = new ControllerTest(new SampleService());
        const verb = ControllersDecorators.GetVerb(ControllerTest, "PostAction");

        expect(verb).toBe(HTTPVerbs.POST);

    });

    test("should retrieve PUT HTTP verb from decorator", () => {

        const controller = new ControllerTest(new SampleService());
        const verb = ControllersDecorators.GetVerb(ControllerTest, "PutAction");

        expect(verb).toBe(HTTPVerbs.PUT);

    });

    test("should retrieve DELETE HTTP verb from decorator", () => {

        const controller = new ControllerTest(new SampleService());
        const verb = ControllersDecorators.GetVerb(ControllerTest, "DeleteAction");

        expect(verb).toBe(HTTPVerbs.DELETE);

    });

    test("should retrieve parameters decorated with FromQuery", () => {

        const controller = new ControllerTest(new SampleService());

        let fromBody = ControllersDecorators.GetFromBodyArgs(
            controller.constructor,
            "TestActionTwo"
        );

        let fromQuery = ControllersDecorators.GetFromQueryArgs(
            controller.constructor,
            "TestActionTwo"
        );

        expect(fromBody.length).toBe(0);
        expect(fromQuery.length).toBe(2);

        fromQuery = ControllersDecorators.GetFromQueryArgs(
            controller.constructor,
            "TestAction"
        );

        expect(fromQuery.length).toBe(1);

    });

    test("should retrieve parameters decorated with FromBody", () => {

        const controller = new ControllerTest(new SampleService());

        const fromBody = ControllersDecorators.GetFromBodyArgs(
            controller.constructor,
            "PostAction"
        );

        const fromQuery = ControllersDecorators.GetFromQueryArgs(
            controller.constructor,
            "PostAction"
        );

        expect(fromBody.length).toBe(1);
        expect(fromQuery.length).toBe(0);

    });

    test("should retrieve required file parameters from FromFile decorator", () => {

        const controller = new ControllerTest(new SampleService());
        const fromFiles = ControllersDecorators.GetFromFilesArgs(
            controller.constructor,
            "FileUpload"
        );

        expect(fromFiles.length).toBe(1);
        expect(fromFiles[0].FileName).toBe("file.pdf");
        expect(fromFiles[0].Required).toBeTruthy();

    });

    test("should retrieve optional file parameters from FromFile decorator", () => {

        const controller = new ControllerTest(new SampleService());
        const fromFiles = ControllersDecorators.GetFromFilesArgs(
            controller.constructor,
            "FileUploadOptional"
        );

        expect(fromFiles.length).toBe(1);
        expect(fromFiles[0].FileName).toBe("file.pdf");
        expect(fromFiles[0].Required).toBeFalsy();

    });

    test("should retrieve controller route from decorator", () => {

        const controller = new ControllerTest(new SampleService());
        const route = ControllersDecorators.GetRoute(ControllerTest);

        expect(route!).toBe("/test");

    });

});5
