import { ControllerTest } from "./classes/ControllerTest";
import { SampleService} from "./classes/SampleServiceTest";
import DependecyService from "../dependencyInjection/DependecyService";
import { DIEscope } from "../dependencyInjection/DependecyService";
import { SampleServiceAbstract } from "./classes/SampleServiceAbstract";
import { AnotherService } from "./classes/AnotherService";
import { ConcreteService, DerivedClassService, TestClassService, WithGenericType } from "./classes/GenericService";
import TestClass, { DerivedClass, ItemTest } from "./classes/TestClass";




describe("Testing the dependecy injection service", ()=>{

    DependecyService.RegisterFor(SampleServiceAbstract, SampleService, DIEscope.TRANSIENT);
    DependecyService.Register(AnotherService, DIEscope.SCOPED);
    DependecyService.Register(ConcreteService, DIEscope.SCOPED);
    DependecyService.RegisterGeneric(WithGenericType, TestClass, TestClassService, DIEscope.SCOPED);
    DependecyService.RegisterGeneric(WithGenericType, DerivedClass, DerivedClassService, DIEscope.SCOPED);
    DependecyService.RegisterGeneric(WithGenericType, undefined, undefined,  DIEscope.SCOPED, e => new WithGenericType(e as new(...args: any[]) => typeof e));
    
    
    test("Testing the creation of a controller", ()=>
    {
        let controller = DependecyService.Build(ControllerTest);

        expect(controller).not.toBeNull();
    
    });


    test("Testing Inject decorator", ()=>
    {
        let controller = DependecyService.Build(ControllerTest);

        expect(controller).not.toBeNull();

        expect(controller.SomeDepency).not.toBeNull();

        expect(controller.SomeDepency instanceof SampleService).toBeTruthy();
    });

    test("Testing InjectAbstract decorator", ()=>
    {
        let controller = DependecyService.Build(ControllerTest);

        expect(controller).not.toBeNull();

        expect(controller.AnotherDepency).not.toBeNull();

        expect(controller.AnotherDepency instanceof SampleService).toBeTruthy();
    });


    test("Testing injection on a private property", ()=>
    {
        let controller = DependecyService.Build(ControllerTest);

        let prop = Reflect.get(controller, "_somePrivateDepency");

        expect(prop).not.toBeNull();

        expect(prop instanceof SampleService).toBeTruthy();
    });


    test("test change implementation of a abstract class on DI service", ()=>
    {
        let controller1 = DependecyService.Build(ControllerTest);

        DependecyService.RegisterFor(SampleServiceAbstract, AnotherService);

        let controller2 = DependecyService.Build(ControllerTest);

        expect(controller1).not.toBeNull();

        expect(controller1.AnotherDepency).not.toBeNull();

        expect(controller1.AnotherDepency instanceof SampleService).toBeTruthy();

        expect(controller2).not.toBeNull();

        expect(controller2.AnotherDepency).not.toBeNull();

        expect(controller2.AnotherDepency instanceof AnotherService).toBeTruthy();

    });


    describe("Test DI in scoped context on application", ()=>{


        test("should be the same instance", ()=>{

            DependecyService.RegisterFor(SampleServiceAbstract, SampleService, DIEscope.SCOPED);
            DependecyService.Register(ControllerTest);
            DependecyService.Register(AnotherService, DIEscope.SCOPED);
            
            let controller1 = DependecyService.Resolve(ControllerTest)!; 

            let dependency = controller1.SomeDepency;
            let scoped = DependecyService.Resolve(SampleServiceAbstract, controller1);
            let infered = DependecyService.Resolve(AnotherService, controller1);

            expect(dependency).not.toBeUndefined();
            expect(dependency.Id).toBe(controller1.AnotherDepency.Id);
            expect(dependency.Id).toBe(scoped?.Id);  
            expect(infered?.Id).toBe(controller1.TypeInferedInjection?.Id);             
        });



        describe("Test DI in transient context on application", ()=>{
    
            test("should be diferents instance", ()=>{
               
        
                DependecyService.RegisterFor(SampleServiceAbstract, SampleService, DIEscope.TRANSIENT);
                DependecyService.Register(ControllerTest);
                DependecyService.Register(AnotherService, DIEscope.TRANSIENT);

                
                let controller1 = DependecyService.Resolve(ControllerTest)!; 
    
                let dependency = controller1.SomeDepency;
                let scoped = DependecyService.Resolve(SampleServiceAbstract, controller1);
                let infered = DependecyService.Resolve(AnotherService, controller1);
    
                expect(dependency).not.toBeUndefined();
                expect(dependency.Id).not.toBe(controller1.AnotherDepency.Id);
                expect(dependency.Id).not.toBe(scoped?.Id);   
                expect(infered?.Id).not.toBe(controller1.TypeInferedInjection?.Id);
            });
    
        });


        describe("Test DI in singleton context on application", ()=>{
    
            test("should be the same instance", ()=>{
               
        
                DependecyService.RegisterFor(SampleServiceAbstract, SampleService, DIEscope.SINGLETON);
                DependecyService.Register(ControllerTest);
                DependecyService.Register(AnotherService, DIEscope.SINGLETON);

                let controller1 = DependecyService.Resolve<ControllerTest>(ControllerTest)!; 
    
                let dependency = controller1.SomeDepency;

                let scoped = DependecyService.Resolve(SampleServiceAbstract, controller1);
                let scoped2 = DependecyService.Resolve(SampleServiceAbstract);
                let infered = DependecyService.Resolve(AnotherService, controller1);

                expect(dependency).not.toBeUndefined();
                expect(dependency.Id).toBe(controller1.AnotherDepency.Id);
                expect(dependency.Id).toBe(scoped?.Id);    
                expect(dependency.Id).toBe(scoped2?.Id);    
                expect(controller1.TypeInferedInjection?.Id).toBe(infered?.Id);    
                            
            });
    
        });

    });


    describe("Test generic DI", ()=>{


        let testService = DependecyService.ResolveGeneric(WithGenericType, TestClass);

        expect(testService instanceof TestClassService).toBeTruthy();
        expect(testService?._type).toBe(TestClass);

        let derivedService = DependecyService.ResolveGeneric(WithGenericType, DerivedClass);

        expect(derivedService instanceof DerivedClassService).toBeTruthy();
        expect(derivedService?._type).toBe(DerivedClass);


        let randomTypeService = DependecyService.ResolveGeneric(WithGenericType, ItemTest);

        expect(randomTypeService instanceof WithGenericType).toBeTruthy();
        expect(randomTypeService?._type).toBe(ItemTest);
        

    });

     describe("Test concrete type DI", ()=>{


        let concreteService = DependecyService.ResolveGeneric(ConcreteService);

        expect(concreteService instanceof ConcreteService).toBeTruthy();
    

    });

});