
declare interface Array<T>
{
  Count(predicate? : (element : T) => boolean) : number;
  Any(predicate? : (element : T) => boolean) : boolean;
  All(predicate : (element : T) => boolean) : boolean;
  FirstOrDefault(predicate? : (element : T) => boolean) : T | undefined;
  First(predicate? : (element : T) => boolean) : T;
  OrderBy(key? : keyof T) : Array<T>;
  OrderByDescending(key? : keyof T) : Array<T>;
  GroupBy(key : keyof T) : IGroupBy<T>[] 
  Aggregate() : IAggregate<T>[]   
  Where(predicate : (element : T) => boolean) : Array<T>;
  Select<U>(translate : (element : T) => U) : U[];
}


Array.prototype.Count = function<T>(predicate? :  (element : T) => boolean)
{
  if(!predicate)
      return this.length;

  let c = 0;
  for(let i of this)
    if(predicate(i))
      c++;

  return c;
}

Array.prototype.Any = function<T>(predicate? :  (element : T) => boolean) : boolean
{
  return this.Count(predicate) > 0;
}

Array.prototype.All = function<T>(predicate : (element : T) => boolean) : boolean
{
    for(let i of this)    
        if(!predicate(i))
            return false;      
    return true;
}

Array.prototype.FirstOrDefault = function<T>(predicate? :  (element : T) => boolean) : T | undefined
{
  if(this.length == 0)
    return undefined;
  else{
    if(!predicate)
      return this[0];
    else {
      let r = this.filter(s => predicate(s));

      if(r.length > 0)
          return r[0];
        else return undefined;
    }
  }
}

Array.prototype.First = function<T>(predicate? :  (element : T) => boolean) : T
{
  if(!predicate)
      return this[0];
    else 
    {
        if(!this.Any(predicate))
            throw new Error("The sequence do not contains elements");

        return this.filter(s => predicate(s))[0];
    }
}


Array.prototype.OrderBy = function<T>(key? : keyof T) : Array<T>
{
  let clone = Array.from(this);

  return clone.sort((s, u) => 
  {
      if(IsNullOrUndefined(s) && IsNullOrUndefined(u))
          return 0;
      if(IsNullOrUndefined(s))
          return 1;
      if(IsNullOrUndefined(u))
        return -1;

      let compareObj1 : any;
      let compareObj2 : any;

      if(key == undefined)
      {
          compareObj1 = s;  
          compareObj2 = u;

      }else
      {
        compareObj1 = s[key];
        compareObj2 = u[key];
      }  
        
      if(typeof compareObj1 == "string")
      {
        return compareObj1.localeCompare(compareObj2);
      }
      else if(typeof compareObj1 == "number" || typeof compareObj1 == "bigint" || compareObj1 instanceof Date)
      {
        let r = compareObj1 as any - compareObj2 as any;

        if(r == 0)
          return r;
        else return r > 0 ? 1 : -1;
      }
      else
      {
          if(!(IsComparable(compareObj1)))
            throw new Error(`Must implemente the IComparable interface`);

          let r =  compareObj1.Compare(compareObj2);

          if(r == 0)
            return r;
          else return r > 0 ? 1 : -1;
      }

      
  });    
}

Array.prototype.OrderByDescending = function<T>(key? : keyof T) : Array<T>
{
    return this.OrderBy(key).reverse();
}


Array.prototype.Where =  function<T>(predicate :  (element : T) => boolean) : Array<T>
{
  return this.filter(s =>  predicate(s));
}

Array.prototype.Select = function<T,U>(translate : (element : T) => U) : U[]
{
  return this.map(s => translate(s));
}

Array.prototype.GroupBy = function<T>(key : keyof T) : IGroupBy<T>[] 
{
    let dic : {Key : any, Values : T[]}[] = []

    for(let i of this)
    {
        let v = dic.FirstOrDefault(s => s.Key == i[key])
        if(v)
            v.Values.push(i);
        else
            dic.push({Key : i[key], Values : [i]});
    }

    return dic;
}

Array.prototype.Aggregate = function<T>() : IAggregate<T>[] 
{
    let dic : {Count : number, Values : T[]}[] = []

    for(let i of this)
    {
        let v = dic.FirstOrDefault(s => s.Values.Any() && s.Values[0] == i)
        if(v){
            v.Values.push(i);
            v.Count++;
        }
        else
            dic.push({Count : 1, Values : [i]});
    }

    return dic;
}

function IsNullOrUndefined(obj  : any) : boolean
{
  return obj == undefined || obj == null;
}


declare interface IComparable<T>
{
  Compare(obj : T) : number;
}

declare interface IGroupBy<T>
{
    Key : any;
    Values : Array<T>    
}

declare interface IAggregate<T>
{
    Count : number;
    Values : Array<T>    
}


function IsComparable<T>(obj : any) : obj is IComparable<T>
{
  if(obj && Reflect.has(obj, "Compare"))
  {
    return typeof obj["Compare"] == "function";       
  }  
  return false;
}