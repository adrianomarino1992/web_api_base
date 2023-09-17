

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

    
    
}
