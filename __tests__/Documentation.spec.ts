import 'reflect-metadata';
import { ControllerTest } from "./classes/ControllerTest";
import { DocumentationDecorators } from "../decorators/documentation/DocumentationDecorators";

describe("Controller documentation decorators", () => {

    test("should retrieve controller headers", () => {

        const headers = DocumentationDecorators.GetControllerHeaders(ControllerTest);

        expect(headers).not.toBeUndefined();
        expect(headers.length).toBe(1);
        expect(headers[0]).toBe("api-token");

    });

    test("should retrieve action headers", () => {

        const headers = DocumentationDecorators.GetActionHeaders(
            ControllerTest,
            "TestAction"
        );

        expect(headers).not.toBeUndefined();
        expect(headers.length).toBe(1);
        expect(headers[0]).toBe("token");

    });

    test("should retrieve action description", () => {

        const description = DocumentationDecorators.GetDescription(
            ControllerTest,
            "TestAction"
        );

        expect(description).not.toBeUndefined();
        expect(description).toBe("Action test");

    });

    test("should retrieve action response sample", () => {
        
        const sample = DocumentationDecorators.GetProducesResponse(
            ControllerTest,
            "TestAction"
        );

        expect(sample).not.toBeUndefined();
        expect(sample.length).toBe(1);
        expect(sample[0].Status).toBe(200);
        expect(sample[0].Description).toBe("Success");
        expect(sample[0].JSON).toBe(
            JSON.stringify({ Result: "result" }, null, 2)
        );

    });

    test("should retrieve action request sample", () => {
        
        const sample = DocumentationDecorators.GetRequestJson(
            ControllerTest,
            "PostAction"
        );

        expect(sample).not.toBeUndefined();
        expect(sample).toBe(
            JSON.stringify({ user: { Name: "Adriano", Age: 99 } })
        );

    });

});
