import MetadataDecorators from "../decorators/metadata/MetadataDecorators";
import ArgumentNullException from "../exceptions/ArgumentNullException";
import InvalidEntityException from "../exceptions/InvalidEntityException";


export default class Type {

    public static CreateTemplateFrom<T extends object>(ctor: new (...args: any[]) => T): T {
        let base = Reflect.construct(ctor, []) as T;

        for (let map in base) {

            if(map.indexOf('_') > -1)
                continue;

            let designType = Reflect.getMetadata("design:type", ctor, map);
            let elementType : ReturnType<typeof MetadataDecorators.GetArrayElementType>;
            if(!designType && base[map] != undefined)
                designType = base[map].constructor;

            if(!designType)
            {
               let propType = MetadataDecorators.GetPropertyType(ctor, map);

               if(propType)
                    designType = propType
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
                    (base as any)[map] = Type.FillObject(Reflect.construct(designType, []) as object);

                else
                {
                    if(elementType)
                    {
                        (base as any)[map] = [Type.FillObject(Reflect.construct(elementType, []) as object)];

                    }
                    else if((base as any)[map] && ((base as any)[map] as Array<unknown>).length > 0)
                    {
                        let element = ((base as any)[map] as Array<unknown>)[0] as any;
                        (base as any)[map] = [Type.FillObject(Reflect.construct(element.constructor, []) as object)];

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

        return Type.FillObject(base);
    }

    public static FillObject<T extends object>(obj: T): T {

        for (let c in obj) {
            let d = Reflect.getMetadata("design:type", obj, c);

            if(!d && obj[c] != undefined && obj[c] != null)
                d = obj[c].constructor;

            if(!d)
            {
                if(c.indexOf('_') != 0)
                    (obj as any)[c] = "";
                continue;
            }

            if (d.name === "Number")
                (obj as any)[c] = -1;
            else if (d.name === "String")
                (obj as any)[c] = "";
            else if (d.name === "Boolean")
                (obj as any)[c] = false;
            else if (d.name === "Date")
                (obj as any)[c] = new Date();
            else if (d.name === "Object")
                (obj as any)[c] = {};
        }

        return obj;
    }

    public static SetPrototype<T>(obj : any, cTor: new (...args: any[]) => T) : void
    {
        obj.__proto__ = cTor.prototype;

        let base = Reflect.construct(cTor, []) as T;

        
        for(let k in base)
        {
            if(base[k] == undefined)
                continue;

            let designType = Reflect.getMetadata("design:type", cTor, k);
            let elementType : ReturnType<typeof MetadataDecorators.GetArrayElementType>;
            if(!designType && base[k] != undefined)
                designType = base[k].constructor;

            if(!designType)
            {
               let propType = MetadataDecorators.GetPropertyType(cTor, k);

               if(propType)
                    designType = propType
            }

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
                    (base as any)[k] = Type.Cast(obj[k], designType);    
                else
                {
                    if(elementType)
                    {
                        for(let i in ((obj[k] as any)))
                        {
                            ((base as any)[k] as any)[i] = Type.Cast(obj[k][i], elementType);
                        }

                    }                    
                    else
                    {
                        (base as any)[k] = obj[k];
                    }
                }
            }else
            {
                (base as any)[k] = obj[k];
            }
                       

        }

    }

    

    public static Cast<T>(obj : any, type: new (...args: any[]) => T ) : T | undefined
    {
        if(obj == undefined || obj== null)
            return undefined;

        if (typeof obj == "string" && obj.indexOf('"') == 0 && obj.lastIndexOf('"') == obj.length - 1)
            obj = obj.substring(1, obj.length - 1);

        if (typeof obj == "string" && obj.indexOf("'") == 0 && obj.lastIndexOf("'") == obj.length - 1)
            obj = obj.substring(1, obj.length - 1);

        if (type.name == Number.name) {
            let number = Number.parseFloat(obj.toString());

            if (number != Number.NaN) {
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

                return Type.CastStringToDateUTC(obj) as T;                

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
           
            Type.SetPrototype(obj, type);
        }
    }

    public static ValidateType(source: any, cTor: new (...args: any[]) => any) {
        
        let empty = Reflect.construct(cTor, []);

        for (let c of Object.keys(empty)) {

            let obj = source[c];
            
            if (empty[c] != undefined && empty[c].constructor == Number) {
                let number = Number.parseFloat(obj?.toString());

                if (number != Number.NaN && obj != undefined) {
                    source[c] = number;
                }
                else {
                    throw new InvalidEntityException(`Can not cast the property "${c}" in Number`);
                }

            } else if (obj != undefined && empty[c] != undefined && empty[c].constructor == String) {
                source[c] =  obj == undefined ? "" : obj.toString();
            }
            else if (empty[c] != undefined && empty[c].constructor == Date) {
                try {
                    source[c] = new Date(obj);
                } catch { throw new InvalidEntityException(`Can not cast the property "${c}" in Date`); }

            }
            else if (empty[c] != undefined && empty[c].constructor == Boolean) {
                try {

                    if(obj == undefined)
                    {
                        throw new InvalidEntityException(`Can not cast the property "${c}" in Boolean`);
                    }

                    if (typeof obj != "boolean") {

                        if(obj.toString().toLowerCase().trim() == "true")
                            source[c] = true;
                        else if (obj.toString().toLowerCase().trim() == "false")
                            source[c] = false;
                        else
                            throw new InvalidEntityException(`Can not cast the property "${c}" in Boolean`);
                        
                    }
                    else {
                        source[c] = obj;
                    }

                } catch { }

            }else if (empty[c] != undefined) 
            {
                this.ValidateType(source[c], empty[c].constructor);
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

    public static CastStringToDateUTC(date : string) : Date
    {
        if(!date)
            return new Date(Date.UTC(0,0,0)); 

        let parts = date.split('-');

        if(parts.length < 3)
            return new Date(Date.UTC(0,0,0)); 

        let time = parts[2].split(' ');  
        
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
    
        return new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], hours[0], hours[1], hours[2]));       

    }


}
