import OwnMetaDataContainer from "../metadata/OwnMetaDataContainer";
import DependecyService, { Ctors } from "./DependecyService";

export function InjectOne<T, U>(constructorFunction: Ctors<T>, genericArgumentType? : Ctors<U>)
{
    return DependecyService.InjectOne(constructorFunction, genericArgumentType);
}

export function InjectGenericTypeArgument<T, U>(constructorFunction: Ctors<T>, genericArgumentType : Ctors<U>)
{
    return DependecyService.InjectGenericType(constructorFunction, genericArgumentType);
       
}



export function InjectForTypeArgument<T>(genericArgumentType : Ctors<T>)
{
    return function(target : Object, property : string | symbol) : void 
    {
        DependecyService.DefinePropertyAsInjectable(target.constructor as Ctors<any>, property.toString());
        OwnMetaDataContainer.Set(target.constructor, DependecyService["_injectableTypeKey"], property.toString(), {Type: Reflect.getMetadata("design:type", target, property), GenericType: genericArgumentType});
    }           
}


export function InjectAbstract<T>(cTor : Ctors<T>)
{
    return DependecyService.InjectOne(cTor);
}


export function Inject()
{
    return DependecyService.Injectable();
}

export { DependecyService } ;
