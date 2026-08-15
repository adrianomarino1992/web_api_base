import "reflect-metadata";
import fs from "fs";
import path from "path";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import { ITestApplicationHost, StartTestApplicationAsync } from "../__test__app__/TestApplicationHost";

describe("Test application integration", () => {
    let host: ITestApplicationHost;
    const uploadsDir = path.join(__dirname, "..", "__test__app__", "controllers", "file", "uploads");

    beforeAll(async () => {
        host = await StartTestApplicationAsync();
    });

    afterAll(async () => {
        if (host)
            await host.stopAsync();
    });

    beforeEach(() => {
        fs.rmSync(uploadsDir, { recursive: true, force: true });
    });

    async function getJson(relativeUrl: string, init?: RequestInit)
    {
        const response = await fetch(`${host.baseUrl}${relativeUrl}`, init);
        const text = await response.text();
        let json: any = undefined;

        if (text)
        {
            try {
                json = JSON.parse(text);
            } catch {
                json = undefined;
            }
        }

        return {
            response,
            text,
            json
        };
    }

    test("should serve sample, static and documentation routes", async () => {
        const sample = await getJson("/sample/ping");
        const docs = await fetch(`${host.baseUrl}/playground`);
        const script = await fetch(`${host.baseUrl}/script.js`);
        const staticFile = await fetch(`${host.baseUrl}/static/ping.txt`);

        expect(sample.response.status).toBe(200);
        expect(sample.json).toEqual({ status: "pong" });

        expect(docs.status).toBe(200);
        expect(await docs.text()).toContain("<div id=\"root\"></div>");

        expect(script.status).toBe(200);
        expect(await script.text()).toContain("StatusController");

        expect(staticFile.status).toBe(200);
        expect((await staticFile.text()).trim()).toBe("static fixture ok");
    });

    test("should resolve dependency injection and middleware pipeline", async () => {
        const result = await getJson("/status/check", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                Property: "payload",
                Date: "2026-08-15T10:00:00"
            })
        });

        expect(result.response.status).toBe(200);
        expect(result.response.headers.get("x-global-after")).toBe("handled");
        expect(result.response.headers.get("x-controller-after")).toBe("handled");
        expect(result.json.status).toBe("OK");
        expect(result.json.payloadType).toBe("SampleService");
        expect(result.json.pipeline).toEqual([
            "global-before-1",
            "global-before-2",
            "controller-before-1",
            "controller-before-2"
        ]);
        expect(result.json.services).toEqual({
            abstract: "AnotherService",
            inferred: "AnotherService",
            concrete: "ConcreteService",
            generic: "unknown",
            genericDerived: "DerivedClass",
            withType: "TestClass",
            withDerivedType: "DerivedClass",
            withDynamicType: "ItemTest"
        });
    });

    test("should bind query string, path params and automatic primitive params", async () => {
        const pathParams = await getJson("/status/silva/joao/30");
        const queryDecorators = await getJson("/status/getwithdecorators?nome=Maria&age=22");
        const queryAuto = await getJson("/status/getwithnodecorators?name=Pedro&age=41");
        const typedQuery = await getJson("/status/getwithoneparamwithdecorator?date=2026-08-15T12:00:00&number=7&bool=true");

        expect(pathParams.response.status).toBe(200);
        expect(pathParams.json).toEqual({ name: "joao", age: 30, lastName: "silva" });

        expect(queryDecorators.response.status).toBe(200);
        expect(queryDecorators.json).toEqual({ name: "Maria", age: 22 });

        expect(queryAuto.response.status).toBe(200);
        expect(queryAuto.json).toEqual({ name: "Pedro", age: 41 });

        expect(typedQuery.response.status).toBe(200);
        expect(typedQuery.json.number).toBe(7);
        expect(typedQuery.json.bool).toBe(true);
        expect(typeof typedQuery.json.date).toBe("string");
    });

    test("should load non-default and folder-based controllers", async () => {
        const omitted = await getJson("/ping/value-1");
        const pathController = await getJson("/alpha/path/getatoasync/code-9");
        const nonDefault = await getJson("/nondefaultexport/ping/value-2");
        const subfolder = await getJson("/subfolder/subfolder/test/ping/value-3");
        const nestedFolder = await getJson("/subfolder/onemorelevel/adm/test/ping/value-4");

        expect(omitted.response.status).toBe(200);
        expect(omitted.json).toEqual({ status: "pong", paRam: "value-1" });

        expect(pathController.response.status).toBe(200);
        expect(pathController.json).toEqual({ paRam: "alpha", codigoParam: "code-9" });

        expect(nonDefault.response.status).toBe(200);
        expect(nonDefault.json).toEqual({ status: "pong", paRam: "value-2" });

        expect(subfolder.response.status).toBe(200);
        expect(subfolder.json).toEqual({ status: "pong", paRam: "value-3" });

        expect(nestedFolder.response.status).toBe(200);
        expect(nestedFolder.json).toEqual({ status: "pong", paRam: "value-4" });
    });

    test("should bind complex body models and apply json property names on the response", async () => {
        const result = await getJson("/status/postwithdecorator", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                Name: "Adriano",
                Age: 34,
                IsActive: true,
                CreatedAt: "2026-08-15T00:00:00",
                option_text: "visible",
                Description: "tester"
            })
        });

        expect(result.response.status).toBe(200);
        expect(result.json.Name).toBe("Adriano");
        expect(result.json.Age).toBe(34);
        expect(result.json.option_text).toBe("visible");
        expect(result.json.OptionText).toBeUndefined();
    });

    test("should enforce model binding and validation rules", async () => {
        const missingBody = await getJson("/status/postofrequiredbodyandcustommessage", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({})
        });

        const validationFail = await getJson("/status/postvalidatedmodel", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                Name: "Al",
                Age: 12,
                Email: "invalid-email"
            })
        });

        const validationSuccess = await getJson("/status/postvalidatedmodel", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                Name: "Alice",
                Age: 25,
                Email: "alice@example.com"
            })
        });

        expect(missingBody.response.status).toBe(400);
        expect(missingBody.json.Detailts).toContain("Some argument is required");

        expect(validationFail.response.status).toBe(400);
        expect(validationFail.json.Message).toBe("Validation fail");
        expect(validationFail.json.Detailts).toEqual(expect.arrayContaining([
            "Name must have at least 3 chars",
            "Age must be 18 or older",
            "Email format is invalid"
        ]));

        expect(validationSuccess.response.status).toBe(200);
        expect(validationSuccess.json).toEqual({
            Name: "Alice",
            Age: 25,
            Email: "alice@example.com"
        });
    });

    test("should support optional and required query/body arguments", async () => {
        const optionalQuery = await getJson("/status/getwithoptionalqueryarg");
        const requiredQuery = await getJson("/status/getwithrequiredqueryargandcustommessage");
        const optionalBody = await getJson("/status/postofoptionalbody", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({})
        });

        expect(optionalQuery.response.status).toBe(200);
        expect(optionalQuery.text).toBe("not provided");

        expect(requiredQuery.response.status).toBe(400);
        expect(requiredQuery.json.Detailts).toContain("Name is required for this GET");

        expect(optionalBody.response.status).toBe(200);
        expect(optionalBody.text).toBe("Some is not provided");
    });

    test("should support partial updates with PATCH", async () => {
        const result = await getJson("/status/patchpartialrecord", {
            method: "PATCH",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                Name: "Updated name"
            })
        });

        expect(result.response.status).toBe(200);
        expect(result.json).toEqual({
            Id: 1,
            Name: "Updated name",
            Email: "original@example.com",
            Active: true
        });
    });

    test("should allow PATCH without body when the action uses only query params", async () => {
        const result = await getJson("/status/patchusingonlyquery?name=only-query", {
            method: "PATCH"
        });

        expect(result.response.status).toBe(200);
        expect(result.json).toEqual({
            updatedField: "name",
            name: "only-query"
        });
    });

    test("should expose all action result status codes", async () => {
        const ok = await fetch(`${host.baseUrl}/results/okresult`);
        const created = await fetch(`${host.baseUrl}/results/createdresult`);
        const accepted = await fetch(`${host.baseUrl}/results/acceptedresult`);
        const noContent = await fetch(`${host.baseUrl}/results/nocontentresult`);
        const badRequest = await fetch(`${host.baseUrl}/results/badrequestresult`);
        const unauthorized = await fetch(`${host.baseUrl}/results/unauthorizedresult`);
        const forbidden = await fetch(`${host.baseUrl}/results/forbiddenresult`);
        const notFound = await fetch(`${host.baseUrl}/results/notfoundresult`);
        const error = await fetch(`${host.baseUrl}/results/errorresult`);
        const exception = await getJson("/results/throwexception");

        expect(ok.status).toBe(200);
        expect(created.status).toBe(201);
        expect(accepted.status).toBe(202);
        expect(noContent.status).toBe(204);
        expect(badRequest.status).toBe(400);
        expect(unauthorized.status).toBe(401);
        expect(forbidden.status).toBe(403);
        expect(notFound.status).toBe(404);
        expect(error.status).toBe(500);
        expect(exception.response.status).toBe(500);
        expect(exception.json.Message).toBe("Boom");
    });

    test("should upload, list, send and download files", async () => {
        const formData = new (globalThis as any).FormData();
        formData.append("file", new Blob(["hello from fixture"]), "hello.txt");

        const upload = await fetch(`${host.baseUrl}/file/uploadfilewithdecorator?name=Adriano&age=33`, {
            method: "POST",
            body: formData
        });

        const uploadJson = await upload.json();
        const list = await getJson("/file/getlistoffiles");
        const send = await fetch(`${host.baseUrl}/file/sendfileasync`);
        const download = await fetch(`${host.baseUrl}/file/downloadfileasync`);

        expect(upload.status).toBe(200);
        expect(uploadJson.name).toBe("Adriano");
        expect(uploadJson.age).toBe(33);
        expect(uploadJson.file.FileName).toBe("hello.txt");

        expect(list.response.status).toBe(200);
        expect(list.json.length).toBe(1);
        expect(list.json[0]).toContain("hello.txt");

        expect(send.status).toBe(200);
        expect(await send.text()).toBe("hello from fixture");

        expect(download.status).toBe(200);
        expect(download.headers.get("content-disposition")).toContain("hello.txt");
    });

    test("should validate required file and file size limits", async () => {
        const optionalForm = new (globalThis as any).FormData();
        const optionalFile = await fetch(`${host.baseUrl}/file/uploadfilewithoptionalfile`, {
            method: "POST",
            body: optionalForm
        });

        const missingRequiredForm = new (globalThis as any).FormData();
        const requiredFile = await fetch(`${host.baseUrl}/file/uploadfilewithrequiredfile`, {
            method: "POST",
            body: missingRequiredForm
        });

        const largeForm = new (globalThis as any).FormData();
        largeForm.append("file", new Blob([new Uint8Array(1024 * 1024 + 16)]), "large.bin");
        const largeFile = await fetch(`${host.baseUrl}/file/uploadfilewith1mbfilesizewithcustommessage`, {
            method: "POST",
            body: largeForm
        });

        expect(optionalFile.status).toBe(200);
        expect(await optionalFile.text()).toBe("Not file provided");

        expect(requiredFile.status).toBe(400);
        expect(await requiredFile.text()).toContain("File is required in this action");

        expect(largeFile.status).toBe(413);
        expect(await largeFile.text()).toContain("The file size is bigger than 1MB");
    });
});
