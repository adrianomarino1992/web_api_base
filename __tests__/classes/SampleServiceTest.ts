export abstract class SampleServiceAbstract
{
    public Id : string = (new Date().getMilliseconds() * Math.random()).toString();
    abstract DoSomething() : void;
    
}



export class SampleService extends SampleServiceAbstract
{  

    public override DoSomething(): void {
        console.log("Doing in SampleServices");
    }
}



export class AnotherService extends SampleServiceAbstract
{

    public override DoSomething(): void {
        console.log("Doing another job in AnotherService");
    }
}