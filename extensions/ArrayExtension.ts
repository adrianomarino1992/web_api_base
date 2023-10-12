declare interface Array<T>
{
  Add(obj : T) : void;
  Clear() : void;
  AddRange(objs : T[]) : void;
  Count(predicate? : (element : T) => boolean) : number;
  Any(predicate? : (element : T) => boolean) : boolean;
  All(predicate : (element : T) => boolean) : boolean;
  FirstOrDefault(predicate? : (element : T) => boolean) : T | undefined;
  First(predicate? : (element : T) => boolean) : T;
  OrderBy<U>(memberExpression? : (element : T) => U) : Array<T>;
  OrderByDescending<U>(memberExpression? : (element : T) => U) : Array<T>;
  GroupBy<U>(memberExpression : (element : T) => U) : IGroupBy<T>[] 
  Aggregate() : IAggregate<T>[]   
  Where(predicate : (element : T) => boolean) : Array<T>;
  Select<U>(translate : (element : T) => U) : U[];
  SelectMany<U>(memberExpression : (element : T) => U[]) : U[];
  Sum(memberExpression? : (element : T) => number) : number;
  Max(memberExpression? : (element : T) => number) : number;
  Min(memberExpression? : (element : T) => number) : number;
  Avg(memberExpression? : (element : T) => number) : number;
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