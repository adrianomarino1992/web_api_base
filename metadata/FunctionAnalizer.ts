import Utils from "../utils/Utils";

export default class FunctionAnalizer 
{
    
    public static ExtractParamsList(target : Object, func: Function): ArgumentOfFunction[] {
        
        let init = func.toString().indexOf('(');
        let end = func.toString().indexOf(')');

        let args = func.toString().substring(init + 1, end);

        let argsAndTypes : ArgumentOfFunction[] = [];

        if(args.trim().length == 0)
            return argsAndTypes;

        let params = Reflect.getMetadata("design:paramtypes", target, func.name);

        args.split(',').forEach((p, i) => 
        {
            argsAndTypes.push(
                {
                    Name : p.trim(), 
                    Index : i, 
                    Type : params[i]
                });
        })
        

        return argsAndTypes;

    }  


    public static GetParametersNames(ctor: string, method : string) : string[]
    {
        let clean = Utils.ReplaceAll(Utils.ReplaceAll(Utils.ReplaceAll(Utils.ReplaceAll(ctor, ' ', ''), '\n', ''), '\r\n', ''), '\t', '')

        let i = clean.indexOf(`{${method}(`);
        if(i == -1)
            i = clean.indexOf(`}${method}(`);
        if(i == -1)
            i = clean.indexOf(`${method}(`);
        
        if(i == -1)
            return [];

        let e = clean.indexOf('{',i);   


        let fun = clean.substring(i, e);

        if(fun.indexOf(',') == -1)
        {
            let l = fun.lastIndexOf('(');
            let j = fun.lastIndexOf(')');
            return [fun.substring(l + 1, j)];
        }

        let parts = fun.split(',');
        let parameters = [];

        for(let p of parts)
        {
        

            if(p.indexOf('(') > -1 && p.indexOf(')') == -1)
            {
                parameters.push(p.substring(p.lastIndexOf('(') + 1));
                continue;
            }

            if(p.indexOf('(') == -1 && p.indexOf(')') > -1)
            {
                parameters.push(p.substring(0, p.indexOf(')')));
                continue;
            }

            parameters.push(p.trim());
        }    


        return parameters;
    }
}

export interface ArgumentOfFunction
{
    Name : string, 
    Index : number,
    Type : Function 
}


