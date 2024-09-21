import { SampleServiceAbstract } from "./SampleServiceAbstract";




export class AnotherService extends SampleServiceAbstract {

    public override DoSomething(): void {
        console.log("Doing another job in AnotherService");
    }
}
