export abstract class SampleServiceAbstract
{
    abstract DoSomething() : void;
}



export class SampleService extends SampleServiceAbstract
{
    public DoSomething(): void {
        console.log("Doing in SampleServices");
    }
}



export class AnotherService extends SampleServiceAbstract
{
    public DoSomething(): void {
        console.log("Doing another job in AnotherService");
    }
}