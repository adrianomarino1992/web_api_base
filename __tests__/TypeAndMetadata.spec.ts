import 'reflect-metadata';
import ValidatedObject, { RelatedClass, SubClassOfValidationObject } from "./classes/ValidatedObject";
import MetadataDecorators from '../decorators/metadata/MetadataDecorators';
import Type from '../metadata/Type';
import { describe, test, expect } from '@jest/globals';

class DateContainer
{
    @MetadataDecorators.CreateMetada()
    public CreatedAt!: Date;
}

describe("Validation decorators", () => {

    test("should retrieve json property name decorator", () => {
       
        let jsonPropertyName = MetadataDecorators.GetJSONPropertyName(ValidatedObject, 'JSONProperty');
        expect(jsonPropertyName).toBe('from_json');

    });


    test("should create the template of type using the json property name metadata", () => {
       
        let type = Type.CreateTemplateFrom(ValidatedObject, {UseJSONPropertyName: true});

        let keys = Object.keys(type);

         expect(keys).toContain('from_json');
         expect(keys).not.toContain('JSONProperty');

    });

    test("should create the template of type NOT using the json property name metadata", () => {
       
        let type = Type.CreateTemplateFrom(ValidatedObject);

        let keys = Object.keys(type);

         expect(keys).not.toContain('from_json');
         expect(keys).toContain('JSONProperty');

    });


    test("should create the instance of type using the json template", () => {
       
        let template = Type.CreateTemplateFrom(ValidatedObject, {UseJSONPropertyName: true});

        let instance = Type.SetPrototype(template, ValidatedObject, {UseJSONPropertyName: true});


        let keys = Object.keys(instance);

         expect(keys).not.toContain('from_json');
         expect(keys).toContain('JSONProperty');    
         

    });


    test("should apply the JSON properties names", () => {
       
        let template = Type.CreateTemplateFrom(ValidatedObject, {UseJSONPropertyName: true});

        let instance = Type.SetPrototype(template, ValidatedObject, {UseJSONPropertyName: true});

        let result = Type.ChangeNameOfPropertyToJSONNames(instance);

        let keys = Object.keys(result);

         expect(keys).toContain('from_json');
         expect(keys).not.toContain('JSONProperty'); 

    });

    test("should parse local datetime strings without shifting the local clock", () => {
        let date = Type.CastStringToDate("2026-08-15T10:20:30");

        expect(date.getFullYear()).toBe(2026);
        expect(date.getMonth()).toBe(7);
        expect(date.getDate()).toBe(15);
        expect(date.getHours()).toBe(10);
        expect(date.getMinutes()).toBe(20);
        expect(date.getSeconds()).toBe(30);
    });

    test("should preserve UTC instants when the source contains Z", () => {
        let date = Type.CastStringToDate("2026-08-15T10:20:30Z");

        expect(date.toISOString()).toBe("2026-08-15T10:20:30.000Z");
    });

    test("should preserve explicit timezone offsets when parsing dates", () => {
        let date = Type.CastStringToDate("2026-08-15T10:20:30-03:00");

        expect(date.toISOString()).toBe("2026-08-15T13:20:30.000Z");
    });

    test("should return undefined when casting an invalid date string", () => {
        let date = Type.Cast("not-a-date", Date);

        expect(date).toBeUndefined();
    });

    test("should use the same date parser when validating object properties", () => {
        let payload: any = { CreatedAt: "2026-08-15T10:20:30-03:00" };

        Type.ValidateType(payload, DateContainer);

        expect(payload.CreatedAt instanceof Date).toBe(true);
        expect(payload.CreatedAt.toISOString()).toBe("2026-08-15T13:20:30.000Z");
    });



    

});
