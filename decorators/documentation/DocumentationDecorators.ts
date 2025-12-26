export class DocumentationDecorators {

    constructor() { }

    private static _descriptionKeyMetadata = "meta:descriptionKey";
    private static _requestKeyMetadata = "meta:requestJsonKey";
    private static _responseKeyMetadata = "meta:responseJsonKey";
    private static _controllerUseHeaderKeyMetadata = "meta:controllerUseHeaderKeyMetadata";
    private static _controllerActionUseHeaderKeyMetadata = "meta:controllerActionUseHeaderKeyMetadata";

    public static Description(description: string) {
        return function (target: Object, methodName: string, propertyDescriptor: PropertyDescriptor) {
            Reflect.defineMetadata(DocumentationDecorators._descriptionKeyMetadata, description, typeof target == 'function' ? target.prototype : target , methodName);
 
        };
    }

    public static GetDescription(target: Function, method: string): string | undefined {
        return Reflect.getMetadata(DocumentationDecorators._descriptionKeyMetadata, typeof target == 'function' ? target.prototype : target, method);
    }

    public static RequestJson(json: string) {
        return function (target: Object, methodName: string, propertyDescriptor: PropertyDescriptor) {
            Reflect.defineMetadata(DocumentationDecorators._requestKeyMetadata, json, typeof target == 'function' ? target.prototype : target, methodName);

        };
    }

    public static GetRequestJson(target: Function, method: string): string | undefined {
        return Reflect.getMetadata(DocumentationDecorators._requestKeyMetadata, typeof target == 'function' ? target.prototype : target, method);
    }

    public static ProducesResponse(response : { Status : number, Description? : string, JSON? : string }) {
        return function (target: Object, methodName: string, propertyDescriptor: PropertyDescriptor) {
            
            let meta = DocumentationDecorators.GetProducesResponse(typeof target == 'function' ? target.prototype : target, methodName);

            meta.push(response);
            
            Reflect.defineMetadata(DocumentationDecorators._responseKeyMetadata, meta, typeof target == 'function' ? target.prototype : target, methodName);

        };
    }

    public static GetProducesResponse(target: Function, method: string): Parameters<typeof DocumentationDecorators.ProducesResponse>[0][] {

        return Reflect.getMetadata(DocumentationDecorators._responseKeyMetadata, typeof target == 'function' ? target.prototype : target, method) ?? [];
    }

    public static ControllerHeader(header: string) {
        return function (target: Object) {

            let headers = DocumentationDecorators.GetControllerHeaders(target);

            let index = headers.findIndex(s => s == header.trim());

            if(index >= 0)
                return;

            headers.push(header.trim())

            Reflect.defineMetadata(DocumentationDecorators._controllerUseHeaderKeyMetadata, headers, typeof target == 'function' ? target.prototype : target);

        };
    }

    public static GetControllerHeaders(target: Object): string[] {
        return Reflect.getMetadata(DocumentationDecorators._controllerUseHeaderKeyMetadata, typeof target == 'function' ? target.prototype : target) ?? [];
    }


    public static ActionHeader(header: string) {
        return function (target: Object, method : string, propertyDescriptor: PropertyDescriptor) {

            let headers = DocumentationDecorators.GetActionHeaders(typeof target == 'function' ? target.prototype : target, method);

            let index = headers.findIndex(s => s == header.trim());

            if(index >= 0)
                return;

            headers.push(header.trim())

            Reflect.defineMetadata(DocumentationDecorators._controllerActionUseHeaderKeyMetadata, headers, typeof target == 'function' ? target.prototype : target, method);

        };
    }

    public static GetActionHeaders(target: Object, method: string): string[] {
        return Reflect.getMetadata(DocumentationDecorators._controllerActionUseHeaderKeyMetadata, typeof target == 'function' ? target.prototype : target, method) ?? [];
    }
    
}
