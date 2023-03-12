import { ControllerTest } from "../../classes/ControllerTest";
import { SampleService, SampleServiceAbstract, AnotherService } from "../../classes/SampleServiceTest";
import DependecyService from "../../../dependencyInjection/DependecyService";




describe("testing the dependecy injection service", ()=>{

    DependecyService.RegisterFor(SampleServiceAbstract, SampleService);

    test("testing the creation of a controller", ()=>
    {
        let controller = DependecyService.Build(ControllerTest) as unknown as ControllerTest;

        expect(controller).not.toBeNull();
    
    })


    test("testing Inject decorator", ()=>
    {
        let controller = DependecyService.Build(ControllerTest) as unknown as ControllerTest;

        expect(controller).not.toBeNull();

        expect(controller.SomeDepency).not.toBeNull();

        expect(controller.SomeDepency instanceof SampleService).toBeTruthy();
    })

    test("testing InjectAbstract decorator", ()=>
    {
        let controller = DependecyService.Build(ControllerTest) as unknown as ControllerTest;

        expect(controller).not.toBeNull();

        expect(controller.AnotherDepency).not.toBeNull();

        expect(controller.AnotherDepency instanceof SampleService).toBeTruthy();
    })


    test("test change implementation of a abstract class on DI service", ()=>
    {
        let controller1 = DependecyService.Build(ControllerTest) as unknown as ControllerTest;

        DependecyService.RegisterFor(SampleServiceAbstract, AnotherService);

        let controller2 = DependecyService.Build(ControllerTest) as unknown as ControllerTest;

        expect(controller1).not.toBeNull();

        expect(controller1.AnotherDepency).not.toBeNull();

        expect(controller1.AnotherDepency instanceof SampleService).toBeTruthy();

        expect(controller2).not.toBeNull();

        expect(controller2.AnotherDepency).not.toBeNull();

        expect(controller2.AnotherDepency instanceof AnotherService).toBeTruthy();

    })


});