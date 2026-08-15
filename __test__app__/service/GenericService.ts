export default class GenericService<T>
{
    private _type: new (...args: any[]) => T;

    constructor(ctor: new (...args: any[]) => T)
    {
        this._type = ctor;
    }

    public Run<U>(list: U[]): U[]
    {
        return list;
    }

    public GetTypeName(): string
    {
        return this._type?.name ?? "unknown";
    }
}
