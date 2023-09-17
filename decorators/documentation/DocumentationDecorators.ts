import 'reflect-metadata';

export class DocumentationDecorators {

    constructor() { }

    private static _descriptionKeyMetadata = "meta:descriptionKey";
    private static _requestKeyMetadata = "meta:requestJsonKey";
    private static _responseKeyMetadata = "meta:responseJsonKey";

    public static Description(description: string) {
        return function (target: Object, methodName: string, propertyDescriptor: PropertyDescriptor) {
            Reflect.defineMetadata(DocumentationDecorators._descriptionKeyMetadata, description, target, methodName);

        };
    }

    public static GetDescription(target: Function, method: string): string | undefined {
        return Reflect.getMetadata(DocumentationDecorators._descriptionKeyMetadata, target, method);
    }

    public static RequestJson(json: string) {
        return function (target: Object, methodName: string, propertyDescriptor: PropertyDescriptor) {
            Reflect.defineMetadata(DocumentationDecorators._requestKeyMetadata, json, target, methodName);

        };
    }

    public static GetRequestJson(target: Function, method: string): string | undefined {
        return Reflect.getMetadata(DocumentationDecorators._requestKeyMetadata, target, method);
    }

    public static ProducesResponse(response : { Status : number, Description? : string, JSON? : string }) {
        return function (target: Object, methodName: string, propertyDescriptor: PropertyDescriptor) {
            
            let meta = DocumentationDecorators.GetProducesResponse(target.constructor, methodName);

            meta.push(response);
            
            Reflect.defineMetadata(DocumentationDecorators._responseKeyMetadata, meta, target.constructor, methodName);

        };
    }

    public static GetProducesResponse(target: Function, method: string): Parameters<typeof DocumentationDecorators.ProducesResponse>[0][] {

        return Reflect.getMetadata(DocumentationDecorators._responseKeyMetadata, target, method) ?? [];
    }
}
