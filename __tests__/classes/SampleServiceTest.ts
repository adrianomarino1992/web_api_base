import { SampleServiceAbstract } from "./SampleServiceAbstract";

export class SampleService extends SampleServiceAbstract
{  

    public override DoSomething(): void {
        console.log("Doing in SampleServices");
    }
}



