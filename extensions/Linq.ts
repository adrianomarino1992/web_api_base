import './ArrayExtension';
import Exception from "../exceptions/Exception";


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

Array.prototype.Add = function<T>(obj : T) : void
{
  this.push(obj);
}

Array.prototype.AddRange = function<T>(objs : T[]) : void
{
  this.concat(...objs);
}

Array.prototype.Clear = function() : void
{
  while(this.Any())
    this.pop()
}

Array.prototype.First = function<T>(predicate? :  (element : T) => boolean) : T
{
  if(!predicate)
      return this[0];
    else 
    {
        if(!this.Any(predicate))
            throw new Exception("The sequence do not contains elements");

        return this.filter(s => predicate(s))[0];
    }
}


Array.prototype.OrderBy = function<T, U>(memberExpression? : (element : T) => U) : Array<T> 
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

      if(memberExpression == undefined)
      {
          compareObj1 = s;  
          compareObj2 = u;

      }else
      {
        compareObj1 = memberExpression(s);
        compareObj2 = memberExpression(u);
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
            throw new Exception(`Must implemente the IComparable interface`);

          let r =  compareObj1.Compare(compareObj2);

          if(r == 0)
            return r;
          else return r > 0 ? 1 : -1;
      }

      
  });    
}

Array.prototype.OrderByDescending = function<T, U>(memberExpression? : (element : T) => U) : Array<T>
{
    return this.OrderBy(memberExpression).reverse();
}


Array.prototype.Where =  function<T>(predicate :  (element : T) => boolean) : Array<T>
{
  return this.filter(s =>  predicate(s));
}

Array.prototype.Select = function<T,U>(translate : (element : T) => U) : U[]
{
  return this.map(s => translate(s));
}

Array.prototype.SelectMany = function<T, U>(memberExpression : (element : T) => U[]) : U[]
{
    let aggregate : any[] = [];

    if(!this.Any(s => s != undefined))
      return [] as U[];    

    for(let s of this.Where(s => s != undefined))
      aggregate.concat(memberExpression(s));    

    return aggregate as U[];
}

Array.prototype.GroupBy = function<T,U>(memberExpression : (element : T) => U) : IGroupBy<T>[] 
{
    let dic : {Key : any, Values : T[]}[] = []

    for(let i of this)
    {
        let v = dic.FirstOrDefault(s => s.Key == memberExpression(i))
        if(v)
            v.Values.push(i);
        else
            dic.push({Key : memberExpression(i), Values : [i]});
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

Array.prototype.Sum = function<T>(memberExpression? : (element : T) => number) : number
{ 
  let sum = 0;
  
  for(let i of this)
  {
    let v = memberExpression && i ? memberExpression(i) : i; 

    if(typeof v == "bigint" || typeof v == "number")    
      sum += v as number;
    else
      throw new Exception("This operation can only by perfomed in number fields");    
  }

  return sum;
}

Array.prototype.Max = function<T>(memberExpression? : (element : T) => number) : number
{   
  
  if(!this.Any())
    throw new Exception("The sequence do not contains elements"); 

  let max = memberExpression ? memberExpression(this[0]) : this[0];

  for(let i of this)
  {
    let v = memberExpression && i ? memberExpression(i) : i; 

    if(typeof v == "bigint" || typeof v == "number")    
      max = v as number > max ? v as number : max;
    else
      throw new Exception("This operation can only by perfomed in number fields");    
  }

  return max;
}

Array.prototype.Min = function<T>(memberExpression? : (element : T) => number) : number
{  

  if(!this.Any())
    throw new Exception("The sequence do not contains elements"); 
  
  let min = memberExpression ? memberExpression(this[0]) : this[0];
  
  for(let i of this)
  {
    let v = memberExpression && i ? memberExpression(i) : i; 

    if(typeof v == "bigint" || typeof v == "number")    
      min = v as number < min ? v as number : min;
    else
      throw new Exception("This operation can only by perfomed in number fields");    
  }

  return min;
}

Array.prototype.Avg = function<T>(memberExpression? : (element : T) => number) : number
{
  if(!this.Any())
    throw new Exception("The sequence do not contains elements"); 
    
  return this.Sum(memberExpression) / this.Count();

}

function IsNullOrUndefined(obj  : any) : boolean
{
  return obj == undefined || obj == null;
}





function IsComparable<T>(obj : any) : obj is IComparable<T>
{
  if(obj && Reflect.has(obj, "Compare"))
  {
    return typeof obj["Compare"] == "function";       
  }  
  return false;
}