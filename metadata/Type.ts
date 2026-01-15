import MetadataDecorators from "../decorators/metadata/MetadataDecorators";
import ArgumentNullException from "../exceptions/ArgumentNullException";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import OwnMetaDataContainer from "./OwnMetaDataContainer";


export interface IMethodOptions
{
    UseJSONPropertyName? : boolean;
    UseIgnoreProperty? : boolean
}

export default class Type {

    public static CreateTemplateFrom<T extends object>(ctor: new (...args: any[]) => T, options? : IMethodOptions & {IgnorePaths? : (keyof T)[]}): T {
        let base = Reflect.construct(ctor, []) as T;

        let keysVisiteds : string[] = [];

        let metadataOfCtor = OwnMetaDataContainer.GetAllMetadataForCtor(ctor).filter(s => s.Member && typeof (s.CTor.prototype as any)[s.Member] != 'function');        
        
        for(let map of [...metadataOfCtor.map(s => s.Member!), ...Object.keys(base as any)])
        {
            if(keysVisiteds.includes(map))
                continue;

            if(options?.IgnorePaths && options.IgnorePaths.filter(s => s == map).length > 0)
            {
                delete (base as any)[map];
                continue;
            }

            if(map.indexOf('_') > -1)
                continue;

            let designType = Reflect.getMetadata("design:type", ctor, map);
            
            if(!designType)
                designType = Reflect.getMetadata("design:type", ctor.prototype, map);

            let elementType : ReturnType<typeof MetadataDecorators.GetArrayElementType>;
            
            if(!designType && (base as any)[map] != undefined)
                designType = (base as any)[map].constructor;

             if(!designType)
            {
                const metaOfField = metadataOfCtor.filter(s => s.Member == map && s.Key == "design:type");

                if(metaOfField.length > 0)
                    designType = metaOfField[0].Value as Function;
            }
            

            if(!designType || designType == Array)
            {
                let elType = MetadataDecorators.GetArrayElementType(ctor, map);
    
                if(elType)
                {
                    designType = Array;
                    elementType = elType;
                }
            }

            if (designType) 
            {
                if (designType != Array)
                    (base as any)[map] = Type.FillObject(Reflect.construct(designType, []) as object, options);

                else
                {
                    if(elementType)
                    {
                        (base as any)[map] = [Type.FillObject(Reflect.construct(elementType, []) as object, options)];

                    }
                    else if((base as any)[map] && ((base as any)[map] as Array<unknown>).length > 0)
                    {
                        let element = ((base as any)[map] as Array<unknown>)[0] as any;
                        (base as any)[map] = [Type.FillObject(Reflect.construct(element.constructor, []) as object, options)];

                    }
                    else
                    {
                        (base as any)[map] = [];
                    }
                }
            }else
            {
                (base as any)[map] = "";
            }
        }

        return Type.FillObject(base, options);
    }

    public static FillObject<T extends object>(obj: T, options? : IMethodOptions): T {

        let cs : string[] = [];

        if(!obj)
            return obj;

        for (let c in obj) 
        {
            let d = Reflect.getMetadata("design:type", obj.constructor.prototype, c);

            if(!d && obj[c] != undefined && obj[c] != null)
                d = obj[c].constructor;

            if(!d)
            {
                if(c.indexOf('_') != 0)
                    (obj as any)[c] = "";
                continue;
            }

            let vdefault = MetadataDecorators.GetDefaultValue(obj.constructor, c);
            let toIgnore = options?.UseIgnoreProperty? MetadataDecorators.IsToIgnoreInDocumentation(obj.constructor, c) : undefined;

            if(toIgnore)
                cs.push(c);

            let propertyOnJSON = options?.UseJSONPropertyName ? MetadataDecorators.GetJSONPropertyName(obj.constructor, c) : undefined;
            let propertyOnObject = c.toString();

            if(!toIgnore && propertyOnJSON){
                propertyOnObject = propertyOnJSON;
                (obj as any)[propertyOnObject] = (obj as any)[c];
                cs.push(c);
            }

            if(vdefault != undefined)
            {
                (obj as any)[propertyOnObject] = vdefault;
                    continue;
            }

            if (d.name === "Number")
                (obj as any)[propertyOnObject] = -1;
            else if (d.name === "String")
                (obj as any)[propertyOnObject] = "";
            else if (d.name === "Boolean")
                (obj as any)[propertyOnObject] = false;
            else if (d.name === "Date")
                (obj as any)[propertyOnObject] = new Date();
            else if (d.name === "Object" && !(obj as any)[propertyOnObject])
                (obj as any)[propertyOnObject] = {};
             else if (d == Array && !(obj as any)[propertyOnObject])
                (obj as any)[propertyOnObject] = [];
        }

        for(let c of cs)
            delete (obj as any)[c];

        return obj;
    }

    public static SetPrototype<T>(obj : any, cTor: new (...args: any[]) => T, options? : IMethodOptions) : T
    {
        if([String, Date, Number, Boolean].filter(s => s.name == cTor.name).length > 0)
            return Type.Cast(obj, cTor, options) as T;
        
        if(cTor.name == Object.name)
            return obj;

        obj.__proto__ = cTor.prototype;

        let base = Reflect.construct(cTor, []) as T;

        let keysVisiteds : string[] = [];

        let metadataOfCtor = OwnMetaDataContainer.GetAllMetadataForCtor(cTor).filter(s => s.Member && typeof (s.CTor.prototype as any)[s.Member] != 'function');        
        
        for(let k of [...metadataOfCtor.map(s => s.Member!), ...Object.keys(base as any)])
        {
            if(keysVisiteds.includes(k))
                continue;
           

            keysVisiteds.push(k);

            let propertyOnJSON = options?.UseJSONPropertyName ? MetadataDecorators.GetJSONPropertyName(cTor, k) : undefined;

            if(propertyOnJSON)            
                keysVisiteds.push(propertyOnJSON);
            
            let propertyOnObject = propertyOnJSON ?? k;

            if(obj[propertyOnObject] == undefined)
            {
                let vdefault = MetadataDecorators.GetDefaultValue(cTor, k);
                
                if(vdefault != undefined)
                    (base as any)[k] = vdefault;

                continue;
            }

            let designType = Reflect.getMetadata("design:type", cTor, k.toString());

            if(!designType)
                designType = Reflect.getMetadata("design:type", cTor.prototype, k.toString());

            if(!designType)
            {
                const metaOfField = metadataOfCtor.filter(s => s.Member == k && s.Key == "design:type");

                if(metaOfField.length > 0)
                    designType = metaOfField[0].Value as Function;
            }
                
           

            let elementType : ReturnType<typeof MetadataDecorators.GetArrayElementType>;              

            if(!designType || designType == Array)
            {
                let elType = MetadataDecorators.GetArrayElementType(cTor, k);
    
                if(elType)
                {
                    designType = Array;
                    elementType = elType;
                }
            } 

            if (designType) 
            {
                if (designType != Array)
                    (base as any)[k] = Type.Cast(obj[propertyOnObject], designType, options);    
                else
                {
                    if(elementType)
                    {
                        for(let i in ((obj[propertyOnObject] as any)))                        
                           (base as any)[k][i] = Type.Cast(obj[propertyOnObject][i], elementType, options); 
                    }                    
                    else
                        (base as any)[k] = obj[propertyOnObject];
                }
            }
            else
                (base as any)[k] = obj[propertyOnObject];
                       

        }

        for(let k in obj)
        {
            if(keysVisiteds.indexOf(k) == -1)
                (base as any)[k] = obj[k]; 
        }

        return base;
    }


    public static GetAllMethods(ctor: Function) : Function[]
    {
        let methods : Function[] = [];
        let currentPrototype = ctor.prototype;

        while(currentPrototype != undefined)
        {
            let currentMethods = Reflect.ownKeys(currentPrototype).filter(m => typeof currentPrototype[m] == "function");
            methods.push(...currentMethods.map(s => currentPrototype[s] as Function));
            
            currentPrototype = currentPrototype.__proto__;
        }

        return methods;

    }

    

    public static Cast<T>(obj : any, type: new (...args: any[]) => T , options? : IMethodOptions) : T | undefined
    {
        if(obj == undefined || obj== null)
            return undefined;

        if (typeof obj == "string" && obj.indexOf('"') == 0 && obj.lastIndexOf('"') == obj.length - 1)
            obj = obj.substring(1, obj.length - 1);

        if (typeof obj == "string" && obj.indexOf("'") == 0 && obj.lastIndexOf("'") == obj.length - 1)
            obj = obj.substring(1, obj.length - 1);

        if (type.name == Number.name) {
            let number = Number.parseFloat(obj.toString());

            if (!Number.isNaN(number)) {
                return number as T;
            }
            else
                return undefined;

        } else if (type.name == String.name) {
            return obj.toString() as T;            
        }
        else if (type.name == Date.name) 
        {
            try {

                return Type.CastStringToDate(obj) as T;                

            } catch { return undefined}

        }
        else if (type.name == Boolean.name) 
        
            {
            if (typeof obj != typeof Boolean) {

                let v = obj.toString().toLowerCase() == "true";
                return v as T;
            }
            else 
                return obj as T;   
        }
        else {
           
            return Type.SetPrototype(obj, type, options);
        }
    }

    public static ValidateType(source: any, cTor: new (...args: any[]) => any, options? : IMethodOptions) {
        
         if(cTor == undefined || [String, Date, Number, Boolean].filter(s => s.name == cTor.name).length > 0)
            return;

          let keysVisiteds : string[] = [];           

        let empty = Reflect.construct(cTor, []);
        let metadataOfCtor = OwnMetaDataContainer.GetAllMetadataForCtor(cTor).filter(s => s.Member && typeof (s.CTor.prototype as any)[s.Member] != 'function');        

        for (let c of [...metadataOfCtor.map(s => s.Member!), ...Object.keys(empty as any)]) {

             if(keysVisiteds.includes(c))
                continue;

            

            let propertyOnJSON = options ? MetadataDecorators.GetJSONPropertyName(cTor, c) ?? c : c;

            let obj = source[propertyOnJSON];
            
            let designType = Reflect.getMetadata("design:type", cTor, c.toString());

            if(!designType)
                designType = Reflect.getMetadata("design:type", cTor.prototype, c.toString());

            if(!designType)
            {
                const metaOfField = metadataOfCtor.filter(s => s.Member == c && s.Key == "design:type");

                if(metaOfField.length > 0)
                    designType = metaOfField[0].Value as Function;
            }
                
            let elementType : ReturnType<typeof MetadataDecorators.GetArrayElementType>;              

            if(!designType || designType == Array)
            {
                let elType = MetadataDecorators.GetArrayElementType(cTor, c);
    
                if(elType)
                {
                    designType = Array;
                    elementType = elType;
                }
            } 
            
            if (designType == Number) {
                let number = Number.parseFloat(obj?.toString());

                if (number != Number.NaN && obj != undefined) {
                    source[propertyOnJSON] = number;
                }
                else {
                    throw new InvalidEntityException(`Can not cast the property "${c}" in Number`);
                }

            } else if (obj != undefined &&  designType == String) {
                source[propertyOnJSON] =  obj == undefined ? "" : obj.toString();
            }
            else if (designType == Date && obj) {
                try {
                    source[c] = new Date(obj);
                } catch { throw new InvalidEntityException(`Can not cast the property "${c}" in Date`); }

            }
            else if (designType == Boolean) {
                try {

                    if(obj == undefined)
                    {
                        throw new InvalidEntityException(`Can not cast the property "${c}" in Boolean`);
                    }

                    if (typeof obj != "boolean") {

                        if(obj.toString().toLowerCase().trim() == "true")
                            source[propertyOnJSON] = true;
                        else if (obj.toString().toLowerCase().trim() == "false")
                            source[propertyOnJSON] = false;
                        else
                            throw new InvalidEntityException(`Can not cast the property "${c}" in Boolean`);
                        
                    }
                    else {
                        source[propertyOnJSON] = obj;
                    }

                } catch { }

            }else 
            {
                this.ValidateType(source[propertyOnJSON], designType);
            }
        }
    }

    public static Is<T extends object, U extends object>(obj: T, ctor: new (...args: any[]) => U): boolean {
        if (obj == undefined)
            return false;

        if (obj.constructor == ctor)
            return true;

        let funcCtor = obj.constructor;

        while (funcCtor) {
            if (funcCtor == ctor)
                return true;
        }

        return false;
    }

    public static CastStringToDate(date : string) : Date
    {
        if(!date)
            return new Date(Date.UTC(0,0,0)); 

        let parts = date.split('-');

        if(parts.length < 3)
            return new Date(Date.UTC(0,0,0)); 

        let time = parts[2].split(' ');  

        if(time.length == 1 && time[0].length > 4)
            time = parts[2].split('T');  
        
        parts[2] = time.shift()!;

        if(time.length == 0 || time[0].indexOf(':') == -1)
            time = ["0","0","0"];
        else
            time = time[0].split(':');    

        let dateParts : number[] = [];

        for(let p of parts)
        {
            let r = Number.parseInt(p);

            if(r == Number.NaN)
                return new Date(Date.UTC(0,0,0)); 
            
            dateParts.push(r);
        }

        let hours : number[] = [];
        for(let p of time)
        {
            let r = Number.parseInt(p);

            if(r == Number.NaN)           
                hours.push(0);
            else
                hours.push(r);

        }

        while(hours.length < 3)
            hours.push(0);
    
        return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hours[0], hours[1], hours[2]);       

    }

    public static RemoveCircularReferences<T extends object>(obj : T) : T
    {
        let clone = Reflect.construct(obj.constructor, []);
        Object.assign(clone, obj);
        let seenRefereces : any[] = [];

        let removeReferences = (target : any) => 
        {
            seenRefereces.push(target);
            
            if('_orm_metadata_' in target)
                delete target._orm_metadata_;
            
            for(let c in target)                
            {
                if(!target[c])
                    continue;

                if(typeof target[c] == 'object')
                {                   
                    if(target[c] instanceof Array)
                    {
                        for(let i of target[c])
                        {                            
                            removeReferences(i);
                        }

                        continue;
                    }
                    if(seenRefereces.includes(target[c]))
                    {
                        target[c] = undefined;
                        continue;
                    }                        
                   
                    removeReferences(target[c])
                }
            }                
          
        }

        removeReferences(clone);
        return clone;

    }


    public static ChangeNameOfPropertyToJSONNames(obj : any)
    {
        let cs : string[] = [];

        if(!obj)
            return obj;

        for (let c in obj) 
        {     
            let propertyOnJSON =  MetadataDecorators.GetJSONPropertyName(obj.constructor, c);          

            if(propertyOnJSON){               
                obj[propertyOnJSON] = obj[c]
                cs.push(c);
            }
        }

        for(let c of cs)
            delete (obj as any)[c];

        return obj;
    }

}
