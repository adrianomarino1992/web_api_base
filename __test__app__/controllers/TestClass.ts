import {ShowInDocumentation, ArrayElementType, CreateMetada, IgnoreInDocumentation, DefaultValue, Route, RunBefore, JSONProperty} from '../../index';



export default class TestClass 
{
    @ShowInDocumentation()
    public Name: string;

    @CreateMetada()
    public Age: number;

    @IgnoreInDocumentation()
    @DefaultValue(false)
    public IsActive: boolean;

    @CreateMetada()
    public CreatedAt: Date;

    @JSONProperty('option_text')
    public OptionText?: string;


    public Description: string;

    private _phone: number;

    constructor(name: string, age: number, isActive: boolean, createdAt: Date, description: string, phone : number) 
    {
        this.Name = name;
        this.Age = age;
        this.IsActive = isActive;
        this.CreatedAt = createdAt;
        this.Description = description;
        this._phone = phone;
    }

    @RunBefore(async (e) => { return })
    public DisplayInfo(): void 
    {
        console.log(`Name: ${this.Name}`);
        console.log(`Age: ${this.Age}`);
        console.log(`Active: ${this.IsActive}`);
        console.log(`Created At: ${this.CreatedAt}`);
        console.log(`Description: ${this.Description}`);
        console.log(`Phone: ${this._phone}`);
    }
}


export class DerivedClass extends TestClass
{
    public Hash: string;

    @ArrayElementType(()=> ItemTest)
    public Itens : ItemTest[];

    constructor(name: string, age: number, isActive: boolean, createdAt: Date, description: string, phone : number, hash : string) 
    {
        super(name, age, isActive, createdAt, description, phone);
        this.Hash = hash;
        this.Itens = [];
    }
}


export class ItemTest
{
    public Name: string;    
    public IsActive: boolean;
    public CreatedAt: Date;
    public Description: string;
    

    constructor(name: string, isActive: boolean, createdAt: Date, description: string) 
    {
        this.Name = name;       
        this.IsActive = isActive;
        this.CreatedAt = createdAt;
        this.Description = description;
       
    }

    public DisplayInfo(): void 
    {
        console.log(`Name: ${this.Name}`);       
        console.log(`Active: ${this.IsActive}`);
        console.log(`Created At: ${this.CreatedAt}`);
        console.log(`Description: ${this.Description}`);
    }
}