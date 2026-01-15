import 'reflect-metadata';
import ValidatedObject, { RelatedClass, SubClassOfValidationObject } from "./classes/ValidatedObject";
import ValidationDecorators from "../decorators/validations/ValidationDecorators";

describe("Validation decorators", () => {

    test("should retrieve all validation metadata and verify their values", () => {

        const required = ValidationDecorators.IsRequired(ValidatedObject, "Required");
        const maxLenght = ValidationDecorators.GetMaxlenght(ValidatedObject, "MaxLenght");
        const minLenght = ValidationDecorators.GetMinlenght(ValidatedObject, "MinLenght");
        const minValue = ValidationDecorators.GetMinValue(ValidatedObject, "MinValue");
        const maxValue = ValidationDecorators.GetMaxValue(ValidatedObject, "MaxValue");
        const rules = ValidationDecorators.GetRules(ValidatedObject, "Permissions");
 ([
            required,
            maxLenght,
            minLenght,
            minValue,
            maxValue
        ] as { Message: string }[]).forEach(metadata => {

            expect(metadata).not.toBeNull();
            expect(metadata.Message.length).toBeGreaterThan(0);

        });


        expect(rules.length).toBe(2);

        for(let rule of rules)
        {5
            expect(rule.Function).not.toBeNull();
            expect(rule.Message.length).toBeGreaterThan(0);
            expect(typeof rule.Function).toBe("function");
        }


    });


    test("should retrieve all validation metadata of a subclass and verify their values", () => {

        const required = ValidationDecorators.IsRequired(SubClassOfValidationObject, "Required");
        const maxLenght = ValidationDecorators.GetMaxlenght(SubClassOfValidationObject, "MaxLenght");
        const minLenght = ValidationDecorators.GetMinlenght(SubClassOfValidationObject, "MinLenght");
        const minValue = ValidationDecorators.GetMinValue(SubClassOfValidationObject, "MinValue");
        const maxValue = ValidationDecorators.GetMaxValue(SubClassOfValidationObject, "MaxValue");
        const rules = ValidationDecorators.GetRules(SubClassOfValidationObject, "Permissions");

        ([
            required,
            maxLenght,
            minLenght,
            minValue,
            maxValue
        ] as { Message: string }[]).forEach(metadata => {

            expect(metadata).not.toBeNull();
            expect(metadata.Message.length).toBeGreaterThan(0);

        });


        expect(rules.length).toBe(2);

        for(let rule of rules)
        {
            expect(rule.Function).not.toBeNull();
            expect(rule.Message.length).toBeGreaterThan(0);
            expect(typeof rule.Function).toBe("function");
        }

        

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

   


     test("should validate the object using inherited method from ValidableClass", () => {

        const obj = new ValidatedObject();

        obj.MaxValue = 9;
        obj.MinValue = 11;
        obj.Range = 15;
        obj.Required = "provided";
        obj.MaxLenght = "12345678910";
        obj.MinLenght = "12345678910";
        obj.RegExp = "adriano@test.com";
        obj.Permissions = ["a", "b", "c", "d", "e", "f"];

        const result = obj.ValidateObject();

        expect(result.length).toBe(0);

    });

    test("should validate the object of a subclass successfully when all rules are satisfied", () => {

        const obj = new SubClassOfValidationObject();

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


     test("should validate the related object successfully when all rules are satisfied", () => {

        const obj = new SubClassOfValidationObject();

        obj.MaxValue = 9;
        obj.MinValue = 11;
        obj.Range = 15;
        obj.Required = "provided";
        obj.MaxLenght = "12345678910";
        obj.MinLenght = "12345678910";
        obj.RegExp = "adriano@test.com";
        obj.Permissions = ["a", "b", "c", "d", "e", "f"];
        obj.RelatedClass = new RelatedClass();
        obj.RelatedClass.MaxValue = 9;
        obj.RelatedClass.MinValue = 11;
        obj.RelatedClass.Range = 15;
        obj.RelatedClass.Required = "provided";
        obj.RelatedClass.MaxLenght = "12345678910";
        obj.RelatedClass.MinLenght = "12345678910";
        obj.RelatedClass.RegExp = "adriano@test.com";
        obj.RelatedClass.Permissions = ["a", "b", "c", "d", "e", "f"];

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

     test("should return validation errors using the inherited method of ValidableClass", () => {

        const obj = new ValidatedObject();

        obj.MaxValue = 11;
        obj.MinValue = 9;
        obj.Range = 21;
        obj.Required = "";
        obj.MaxLenght = "123456789101234567891012345678910";
        obj.MinLenght = "1234";
        obj.RegExp = "adriano.test.com";
        obj.Permissions = ["a", "b", "c", "d", "e"];

        const result = obj.ValidateObject();

        expect(result.length).toBe(8);

    });


    test("should fail on second rule of Permission field", () => {

        const obj = new ValidatedObject();

        obj.MaxValue = 9;
        obj.MinValue = 11;
        obj.Range = 15;
        obj.Required = "provided";
        obj.MaxLenght = "12345678910";
        obj.MinLenght = "12345678910";
        obj.RegExp = "adriano@test.com";
        obj.Permissions = ["a", "b", "c", "d", "e", "f", "a", "b", "c", "d", "e", "f", "a", "b", "c", "d", "e", "f"];

        const result = ValidationDecorators.Validate(obj);

        expect(result.length).toBe(1);
        expect(result[0].Message).toContain('10');

    });



    test("should return validation error when a rule fails on a related object", () => {

        const obj = new ValidatedObject();

        obj.MaxValue = 9;
        obj.MinValue = 11;
        obj.Range = 15;
        obj.Required = "provided";
        obj.MaxLenght = "12345678910";
        obj.MinLenght = "12345678910";
        obj.RegExp = "adriano@test.com";
        obj.Permissions = ["a", "b", "c", "d", "e", "f"];
        obj.RelatedClass = new RelatedClass();
        obj.RelatedClass.MaxValue = 9;
        obj.RelatedClass.MinValue = 11;
        obj.RelatedClass.Range = 15;
        obj.RelatedClass.Required = "provided";
        obj.RelatedClass.MaxLenght = "12345678910";
        obj.RelatedClass.MinLenght = "12345678910";
        obj.RelatedClass.RegExp = "adriano@test.com";
        

        const result = ValidationDecorators.Validate(obj);

        expect(result.length).toBe(1);
        expect(result[0].Field).toBe("Permissions");

    });

});
