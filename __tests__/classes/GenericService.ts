import TestClass, { DerivedClass } from "./TestClass";

export default class GenericService<T>
{
    private _type : new (...args:any[]) => T;

    constructor(ctor : new (...args:any[]) => T)
    {
        this._type = ctor;
    }

    public Run<T>(list: T[]) : T[]
    {
        return list;
    }

    public GetType()
    {
        return this._type.name;
    }

}



export class WithGenericType<T>  
{
    _type : new (...args: any[]) => T;

    constructor(ctor : new (...args: any[]) => T)
    {
        
        this._type = ctor;
    }

    public DoSomething(): void {
        console.log("Doing another job");
    }

    public GetType()
    {
        return this._type;
    }
}


export class TestClassService extends WithGenericType<TestClass>
{
    constructor()
    {
        super(TestClass);
    }
}

export class DerivedClassService extends WithGenericType<DerivedClass>
{
    constructor()
    {
        super(DerivedClass);
    }
}



export class ConcreteService
{
    public Property : string = "";
    public Date : Date = new Date();
    public DoSomething(): void {
        console.log("Doing");
    }
}

