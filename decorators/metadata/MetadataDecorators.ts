import OwnMetadaContainer from '../../metadata/OwnMetaDataContainer';


export default class MetadataDecorators 
{
    private static _addMetadataKeyMetadata : string = "meta:add-metadata-property-key";
    private static _ignoreKeyMetadata : string = "meta:ignore-property-key";
    private static _showInDocumentationKeyMetadata : string = "meta:show-documentation-property-key";
    private static _arrayOfTypeKeyMetadata : string = "meta:array-oftype-property-key";
    private static _defaultValueKeyMetadata : string = "meta:default-value-property-key";


    public static CreateMetada()
    {
        return function(target : any, property : string)
        {
            OwnMetadaContainer.Set(target, MetadataDecorators._addMetadataKeyMetadata, property, true);
        }
    }
    

    public static IgnoreInDocumentation()
    {
        return function(target : any, property : string)
        {
            OwnMetadaContainer.Set(target, MetadataDecorators._ignoreKeyMetadata, property, true);
        }
    }

    public static IsToIgnoreInDocumentation(cTor : Function, property : string) : boolean
    {
        let meta =  OwnMetadaContainer.Get(cTor, MetadataDecorators._ignoreKeyMetadata, property);

        if(!meta)
            return false;

        return meta.Value ?? false;
    }

    public static ShowInDocumentation()
    {
        return function(target : Object, property : string)
        {
            OwnMetadaContainer.Set(target.constructor, MetadataDecorators._ignoreKeyMetadata, property, true);
        }
    }

    public static IsToShowInDocumentation(cTor : Function, property : string) : boolean
    {
        let meta =  OwnMetadaContainer.Get(cTor, MetadataDecorators._showInDocumentationKeyMetadata, property);

        if(!meta)
            return false;

        let value = meta.Value ?? false;

        return value && !this.IsToIgnoreInDocumentation(cTor, property);
    }

    public static ArrayElementType(typeBuilder : () => new (...args: any[])=> any)
    {
        return function(target : any, property : string)
        {
            OwnMetadaContainer.Set(target, MetadataDecorators._arrayOfTypeKeyMetadata, property, typeBuilder);
        }
    }

    public static GetArrayElementType(cTor : Function, property : string) : (new (...args: any[])=> any) | undefined
    {
        let meta = OwnMetadaContainer.Get(cTor, MetadataDecorators._arrayOfTypeKeyMetadata, property);

        if(!meta || !meta.Value)
            return undefined;
        
        return meta.Value();
    }
    


    public static DefaultValue(value: any) 
    {
        return function(target : any, property : string)
        {
            OwnMetadaContainer.Set(target, MetadataDecorators._defaultValueKeyMetadata, property, value);
        }
    }
    

    public static GetDefaultValue(cTor : Function, property : string)
    {
        let meta = OwnMetadaContainer.Get(cTor, MetadataDecorators._defaultValueKeyMetadata, property);

            if(!meta || meta.Value == undefined)
                return undefined;
            
            return meta.Value;
    }

}


