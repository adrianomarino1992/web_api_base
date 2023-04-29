

import  ValidatedObject from "./classes/ValidatedObject";
import ValidationDecorators from "../decorators/validations/ValidationDecorators";

describe('Testing validations decorators', ()=>
{

    test("Testing get all and check their values", ()=>
    {
        let obj = new ValidatedObject();
        
        let required = ValidationDecorators.IsRequired(obj, "Required");
        let maxLenght = ValidationDecorators.GetMaxlenght(obj, "MaxLenght");
        let minLenght = ValidationDecorators.GetMinlenght(obj, "MinLenght");        
        let minValue = ValidationDecorators.GetMinValue(obj, "MinValue");
        let maxValue = ValidationDecorators.GetMaxValue(obj, "MaxValue");
        let rule = ValidationDecorators.GetRule(obj, "Permissions");

        ([required, maxLenght, minLenght, minValue, maxValue, rule] as {Message : string}[]).forEach(s => {

            expect(s).not.toBeNull();
            expect(s.Message.length).toBeGreaterThan(0);
        });

        expect(rule?.Function).not.toBeNull();
        expect(typeof rule?.Function).toBe("function");

    });


    test("Testing validate the object, must exit with success status", ()=>{

        let obj = new ValidatedObject();

        obj.MaxValue = 9;
        obj.MinValue = 11;
        obj.Range = 15;
        obj.Required = "provided";
        obj.MaxLenght = "12345678910";
        obj.MinLenght = "12345678910";
        obj.RegExp = "adriano@test.com";
        obj.Permissions = ["a", "b", "c", "d", "e", "f"];

        let result = ValidationDecorators.Validate(obj);

        expect(result.length).toBe(0);
        
    });


    test("Testing validate the object, all must fail", ()=>{

        let obj = new ValidatedObject();

        obj.MaxValue = 11;
        obj.MinValue = 9;
        obj.Range = 21;
        obj.Required = "";
        obj.MaxLenght = "123456789101234567891012345678910";
        obj.MinLenght = "1234";
        obj.RegExp = "adriano.test.com";
        obj.Permissions = ["a", "b", "c", "d", "e"];

        let result = ValidationDecorators.Validate(obj);

        expect(result.length).toBe(8);
        
    });

    

})