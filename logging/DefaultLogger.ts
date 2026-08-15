import ILogger from "../interfaces/ILogger";

export class DefaultLogger implements ILogger
{
    public Debug(...args: any[]): void
    {
        console.log(...args);
    }

    public Info(...args: any[]): void
    {
        console.log(...args);
    }

    public Warn(...args: any[]): void
    {
        console.log(...args);
    }

    public Error(...args: any[]): void
    {
        console.log(...args);
    }
}

export const DefaultApplicationLogger = new DefaultLogger();
