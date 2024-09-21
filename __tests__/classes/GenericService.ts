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