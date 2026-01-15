
import { ValidableClass } from '../../decorators/validations/ValidationDecorators';
import {Required, MaxLenght, MinLenght, Rule, Max, Min, Regex, JSONProperty}  from '../../index';


export default class ValidatedObject extends ValidableClass
{
    @Max(10)
    public MaxValue : number;

    @Min(10)
    public MinValue : number;

    @Min(10)
    @Max(20)
    public Range: number;

    @Regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    public RegExp : string;

    @Required()    
    public Required : string;

    @MaxLenght(20)    
    public MaxLenght : string;

    @MinLenght(10)
    public MinLenght : string;
    
    @Rule(p => p.length > 5)  
    @Rule(p => p.length < 10, 'Permission max lenght: 10')    
    public Permissions : string[];

    
    @JSONProperty('from_json')
    public JSONProperty : string;


    public RelatedClass? : RelatedClass;

    constructor()
    {
        super();
        this.MaxValue = -1;
        this.MinValue = -1;
        this.Range = -1;
        this.Required = "";
        this.MaxLenght = ""; 
        this.MinLenght = ""; 
        this.RegExp = "";
        this.Permissions = [];
        this.JSONProperty = "";
       
    }
}



export class SubClassOfValidationObject extends ValidatedObject
{
    constructor()
    {
        super()
    }
}


export class RelatedClass 
{
     @Max(10)
    public MaxValue : number;

    @Min(10)
    public MinValue : number;

    @Min(10)
    @Max(20)
    public Range: number;

    @Regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    public RegExp : string;

    @Required()    
    public Required : string;

    @MaxLenght(20)    
    public MaxLenght : string;

    @MinLenght(10)
    public MinLenght : string;
    
    @Rule(p => p.length > 5)    
    public Permissions : string[];

    constructor()
    {
        this.MaxValue = -1;
        this.MinValue = -1;
        this.Range = -1;
        this.Required = "";
        this.MaxLenght = ""; 
        this.MinLenght = ""; 
        this.RegExp = "";
        this.Permissions = [];
    }
}

