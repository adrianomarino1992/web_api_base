import InvalidEntityException from "../exceptions/InvalidEntityException";


export default class Type {

    public static CreateTemplateFrom<T extends object>(ctor: new (...args: any[]) => T): T {
        let base = Reflect.construct(ctor, []) as T;

        for (let map in base) {

            let designType = Reflect.getMetadata("design:type", ctor, map);

            if (designType) {
                if (designType != Array)
                    (base as any)[map] = Type.FillObject(Reflect.construct(designType, []) as object);

                else
                    (base as any)[map] = [Type.FillObject(Reflect.construct(designType, []) as object)];
            }
        }

        return Type.FillObject(base);
    }

    public static FillObject<T extends object>(obj: T): T {

        for (let c in obj) {
            let d = Reflect.getMetadata("design:type", obj, c);

            if (!d)
                continue;

            if (d.name === "Number")
                (obj as any)[c] = -1;
            else if (d.name === "String")
                (obj as any)[c] = c;
            else if (d.name === "Boolean")
                (obj as any)[c] = false;
            else if (d.name === "Date")
                (obj as any)[c] = new Date();
            else if (d.name === "Object")
                (obj as any)[c] = {};
        }

        return obj;
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


}
