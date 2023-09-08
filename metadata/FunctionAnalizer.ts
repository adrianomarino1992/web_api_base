
export default class FunctionAnalizer {
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
}

export interface ArgumentOfFunction
{
    Name : string, 
    Index : number,
    Type : Function 
}