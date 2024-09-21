export abstract class SampleServiceAbstract {
    public Id: string = (new Date().getMilliseconds() * Math.random()).toString();
    abstract DoSomething(): void;

}
