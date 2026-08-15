export default interface ILogger
{
    Debug(...args: any[]): void;
    Info(...args: any[]): void;
    Warn(...args: any[]): void;
    Error(...args: any[]): void;
}
