import MetadataDecorators from "../decorators/metadata/MetadataDecorators";
import FunctionAnalizer from "./FunctionAnalizer";
import Type from "./Type";


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


export function JSONProperty(jsonPropertyName: string)
{
    return MetadataDecorators.JSONPropertyName(jsonPropertyName);
}

export {Type};

export {FunctionAnalizer};
