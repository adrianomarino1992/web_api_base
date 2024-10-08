import 'reflect-metadata';

export class DocumentationDecorators {

    constructor() { }

    private static _descriptionKeyMetadata = "meta:descriptionKey";
    private static _requestKeyMetadata = "meta:requestJsonKey";
    private static _responseKeyMetadata = "meta:responseJsonKey";
    private static _controllerUseHeaderKeyMetadata = "meta:controllerUseHeaderKeyMetadata";
    private static _controllerActionUseHeaderKeyMetadata = "meta:controllerActionUseHeaderKeyMetadata";

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

    public static ControllerHeader(header: string) {
        return function (target: Object) {

            let headers = DocumentationDecorators.GetControllerHeaders(target);

            let index = headers.findIndex(s => s == header.trim());

            if(index >= 0)
                return;

            headers.push(header.trim())

            Reflect.defineMetadata(DocumentationDecorators._controllerUseHeaderKeyMetadata, headers, target);

        };
    }

    public static GetControllerHeaders(target: Object): string[] {
        return Reflect.getMetadata(DocumentationDecorators._controllerUseHeaderKeyMetadata, target) ?? [];
    }


    public static ActionHeader(header: string) {
        return function (target: Object, method : string, propertyDescriptor: PropertyDescriptor) {

            let headers = DocumentationDecorators.GetActionHeaders(target, method);

            let index = headers.findIndex(s => s == header.trim());

            if(index >= 0)
                return;

            headers.push(header.trim())

            Reflect.defineMetadata(DocumentationDecorators._controllerActionUseHeaderKeyMetadata, headers, target, method);

        };
    }

    public static GetActionHeaders(target: Object, method: string): string[] {
        return Reflect.getMetadata(DocumentationDecorators._controllerActionUseHeaderKeyMetadata, target, method) ?? [];
    }
    
}
