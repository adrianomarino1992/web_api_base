import OwnMetadaContainer from '../../metadata/OwnMetaDataContainer';


export default class MetadataDecorators 
{
    private static _addMetadataKeyMetadata : string = "meta:add-metadata-property-key";
    private static _ignoreKeyMetadata : string = "meta:ignore-property-key";
    private static _showInDocumentationKeyMetadata : string = "meta:show-documentation-property-key";
    private static _arrayOfTypeKeyMetadata : string = "meta:array-oftype-property-key";
    private static _defaultValueKeyMetadata : string = "meta:default-value-property-key";
    private static _jsonPropertyNameKeyMetadata : string = "meta:default-json-property-key";


    public static CreateMetada()
    {
        return function(target : any, property : string)
        {
            Reflect.defineMetadata(MetadataDecorators._addMetadataKeyMetadata, true, typeof target == 'function' ? target.prototype : target, property);           
        }
    }
    

    public static IgnoreInDocumentation()
    {
        return function(target : any, property : string)
        {
            Reflect.defineMetadata(MetadataDecorators._ignoreKeyMetadata, true, typeof target == 'function' ? target.prototype : target, property);
        }
    }

    public static IsToIgnoreInDocumentation(cTor : Function, property : string) : boolean
    {
        let meta =  Reflect.getMetadata(MetadataDecorators._ignoreKeyMetadata, cTor.prototype, property);

        if(!meta)
            return false;

        return meta ?? false;
    }

    public static ShowInDocumentation()
    {
        return function(target : Object, property : string)
        {
            Reflect.defineMetadata(MetadataDecorators._showInDocumentationKeyMetadata, true, typeof target == 'function' ? target.prototype : target, property);

        }
    }

    public static IsToShowInDocumentation(cTor : Function, property : string) : boolean
    {
        let meta =  Reflect.getMetadata(MetadataDecorators._showInDocumentationKeyMetadata, cTor.prototype, property);

        if(!meta)
            return false;

        let value = meta ?? false;

        return value && !this.IsToIgnoreInDocumentation(cTor, property);
    }

    public static ArrayElementType(typeBuilder : () => new (...args: any[])=> any)
    {
        return function(target : any, property : string)
        {
            OwnMetadaContainer.Set(typeof target == 'function' ? target : target.constructor, MetadataDecorators._arrayOfTypeKeyMetadata, property, typeBuilder);
        }
    }

    public static GetArrayElementType(cTor : Function, property : string) : (new (...args: any[])=> any) | undefined
    {
        let meta = OwnMetadaContainer.Get(cTor, MetadataDecorators._arrayOfTypeKeyMetadata, property);

        if(!meta || !meta.Value)
            return undefined;
        
        return meta.Value();
    }
    

    public static JSONPropertyName(name: string)
    {
        return function(target : any, property : string)
        {
                Reflect.defineMetadata(MetadataDecorators._jsonPropertyNameKeyMetadata, name, typeof target == 'function' ? target.prototype : target, property);

        }
    }

    
    public static GetJSONPropertyName(cTor : Function, property : string) : string | undefined
    {
        let meta =  Reflect.getMetadata(MetadataDecorators._jsonPropertyNameKeyMetadata, cTor.prototype, property);

        return meta;
    }


    public static DefaultValue(value: any) 
    {
        return function(target : any, property : string)
        {
                        Reflect.defineMetadata(MetadataDecorators._defaultValueKeyMetadata, value, typeof target == 'function' ? target.prototype : target, property);

        }
    }
    

    public static GetDefaultValue(cTor : Function, property : string)
    {
        let meta =  Reflect.getMetadata(MetadataDecorators._defaultValueKeyMetadata, cTor.prototype, property);

        return meta;
    }

}


