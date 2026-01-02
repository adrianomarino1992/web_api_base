import 'reflect-metadata';
import ValidatedObject from "./classes/ValidatedObject";
import ValidationDecorators from "../decorators/validations/ValidationDecorators";

describe("Validation decorators", () => {

    test("should retrieve all validation metadata and verify their values", () => {

        const obj = new ValidatedObject();

        const required = ValidationDecorators.IsRequired(obj, "Required");
        const maxLenght = ValidationDecorators.GetMaxlenght(obj, "MaxLenght");
        const minLenght = ValidationDecorators.GetMinlenght(obj, "MinLenght");
        const minValue = ValidationDecorators.GetMinValue(obj, "MinValue");
        const maxValue = ValidationDecorators.GetMaxValue(obj, "MaxValue");
        const rule = ValidationDecorators.GetRule(obj, "Permissions");

        ([
            required,
            maxLenght,
            minLenght,
            minValue,
            maxValue,
            rule
        ] as { Message: string }[]).forEach(metadata => {

            expect(metadata).not.toBeNull();
            expect(metadata.Message.length).toBeGreaterThan(0);

        });

        expect(rule?.Function).not.toBeNull();
        expect(typeof rule?.Function).toBe("function");

    });

    test("should validate the object successfully when all rules are satisfied", () => {

        const obj = new ValidatedObject();

        obj.MaxValue = 9;
        obj.MinValue = 11;
        obj.Range = 15;
        obj.Required = "provided";
        obj.MaxLenght = "12345678910";
        obj.MinLenght = "12345678910";
        obj.RegExp = "adriano@test.com";
        obj.Permissions = ["a", "b", "c", "d", "e", "f"];

        const result = ValidationDecorators.Validate(obj);

        expect(result.length).toBe(0);

    });

    test("should return validation errors when all rules fail", () => {

        const obj = new ValidatedObject();

        obj.MaxValue = 11;
        obj.MinValue = 9;
        obj.Range = 21;
        obj.Required = "";
        obj.MaxLenght = "123456789101234567891012345678910";
        obj.MinLenght = "1234";
        obj.RegExp = "adriano.test.com";
        obj.Permissions = ["a", "b", "c", "d", "e"];

        const result = ValidationDecorators.Validate(obj);

        expect(result.length).toBe(8);

    });

});
