import 'reflect-metadata';
import ValidatedObject, { RelatedClass, SubClassOfValidationObject } from "./classes/ValidatedObject";
import MetadataDecorators from '../decorators/metadata/MetadataDecorators';
import Type from '../metadata/Type';


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



    

});
