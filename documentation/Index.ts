import { DocumentationDecorators } from "../decorators/documentation/DocumentationDecorators";
import MetadataDecorators from "../decorators/metadata/MetadataDecorators";
import Type from "../metadata/Type";


export function ControllerHeader(header : string)       
{
    return DocumentationDecorators.ControllerHeader(header); 
} ;


export function ActionHeader(header : string)       
{
    return DocumentationDecorators.ActionHeader(header); 
} ;

export function Description(description : string)       
{
    return DocumentationDecorators.Description(description); 
} ;

export function RequestJson(json : string)       
{
    return DocumentationDecorators.RequestJson(json); 
} ;


export function ProducesResponse(response : Parameters<typeof DocumentationDecorators.ProducesResponse>[0])       
{
    return DocumentationDecorators.ProducesResponse(response); 
} ;


export function CreateMetada()
{
    return MetadataDecorators.CreateMetada();
}


export function IgnoreInDocumentation()
{
    return MetadataDecorators.IgnoreInDocumentation();
}

export function ShowInDocumentation()
{
    return MetadataDecorators.ShowInDocumentation();
}

export function ArrayElementType(typeBuilder : () => new (...args: any[])=> any)
{
    return MetadataDecorators.ArrayElementType(typeBuilder);
}


export function DefaultValue(value: any) 
{
    return MetadataDecorators.DefaultValue(value);
}

export function CreateJSONSample<T extends Object>(ctor: new (...args: any[]) => T, ignorePaths? : (keyof T)[]) : string
{
    let template = Type.CreateTemplateFrom(ctor, {
        IgnorePaths : ignorePaths, 
        UseIgnoreProperty : true, 
        UseJSONPropertyName : true
    });

    return JSON.stringify(template, null, 2);
}