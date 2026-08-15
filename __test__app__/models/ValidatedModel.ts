import { Max, MaxLenght, Min, MinLenght, Regex, Required } from "../TestAPI";

export default class ValidatedModel
{
    @Required("Name is required")
    @MinLenght(3, "Name must have at least 3 chars")
    @MaxLenght(20, "Name must have at most 20 chars")
    public Name: string;

    @Min(18, "Age must be 18 or older")
    @Max(120, "Age must be 120 or less")
    public Age: number;

    @Regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Email format is invalid")
    public Email: string;

    constructor(name: string, age: number, email: string)
    {
        this.Name = name;
        this.Age = age;
        this.Email = email;
    }
}
