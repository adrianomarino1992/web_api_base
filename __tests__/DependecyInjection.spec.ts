import 'reflect-metadata';
import { ControllerTest } from "./classes/ControllerTest";
import { SampleService } from "./classes/SampleServiceTest";
import DependecyService from "../dependencyInjection/DependecyService";
import { DIEscope } from "../dependencyInjection/DependecyService";
import { SampleServiceAbstract } from "./classes/SampleServiceAbstract";
import { AnotherService } from "./classes/AnotherService";
import {
    ConcreteService,
    DerivedClassService,
    TestClassService,
    WithGenericType
} from "./classes/GenericService";
import TestClass, { DerivedClass, ItemTest } from "./classes/TestClass";

describe("Dependency Injection service", () => {

    DependecyService.RegisterFor(
        SampleServiceAbstract,
        SampleService,
        DIEscope.TRANSIENT
    );

    DependecyService.Register(AnotherService, DIEscope.SCOPED);
    DependecyService.Register(ConcreteService, DIEscope.SCOPED);

    DependecyService.RegisterGeneric(
        WithGenericType,
        TestClass,
        TestClassService,
        DIEscope.SCOPED
    );

    DependecyService.RegisterGeneric(
        WithGenericType,
        DerivedClass,
        DerivedClassService,
        DIEscope.SCOPED
    );

    DependecyService.RegisterGeneric(
        WithGenericType,
        undefined,
        undefined,
        DIEscope.SCOPED,
        e => new WithGenericType(e as new (...args: any[]) => typeof e)
    );

    test("should create a controller instance using the DI container", () => {

        const controller = DependecyService.Build(ControllerTest);

        expect(controller).not.toBeNull();

    });

    test("should inject dependencies using the @Inject decorator", () => {

        const controller = DependecyService.Build(ControllerTest);

        expect(controller).not.toBeNull();
        expect(controller.SomeDepency).not.toBeNull();
        expect(controller.SomeDepency instanceof SampleService).toBeTruthy();

    });

    test("should inject abstract dependencies using the @InjectAbstract decorator", () => {

        const controller = DependecyService.Build(ControllerTest);

        expect(controller).not.toBeNull();
        expect(controller.AnotherDepency).not.toBeNull();
        expect(controller.AnotherDepency instanceof SampleService).toBeTruthy();

    });

    test("should inject dependencies into private properties", () => {

        const controller = DependecyService.Build(ControllerTest);
        const prop = Reflect.get(controller, "_somePrivateDepency");

        expect(prop).not.toBeNull();
        expect(prop instanceof SampleService).toBeTruthy();

    });

    test("should allow changing the implementation of an abstract dependency at runtime", () => {

        const controller1 = DependecyService.Build(ControllerTest);

        DependecyService.RegisterFor(SampleServiceAbstract, AnotherService);

        const controller2 = DependecyService.Build(ControllerTest);

        expect(controller1).not.toBeNull();
        expect(controller1.AnotherDepency).not.toBeNull();
        expect(controller1.AnotherDepency instanceof SampleService).toBeTruthy();

        expect(controller2).not.toBeNull();
        expect(controller2.AnotherDepency).not.toBeNull();
        expect(controller2.AnotherDepency instanceof AnotherService).toBeTruthy();

    });

    describe("Scoped lifetime behavior", () => {

        test("should return the same instance within the same scope", () => {

            DependecyService.RegisterFor(
                SampleServiceAbstract,
                SampleService,
                DIEscope.SCOPED
            );

            DependecyService.Register(ControllerTest);
            DependecyService.Register(AnotherService, DIEscope.SCOPED);

            const controller = DependecyService.Resolve(ControllerTest)!;

            const dependency = controller.SomeDepency;
            const scoped = DependecyService.Resolve(
                SampleServiceAbstract,
                controller
            );

            const inferred = DependecyService.Resolve(
                AnotherService,
                controller
            );

            expect(dependency).not.toBeUndefined();
            expect(dependency.Id).toBe(controller.AnotherDepency.Id);
            expect(dependency.Id).toBe(scoped?.Id);
            expect(inferred?.Id).toBe(controller.TypeInferedInjection?.Id);

        });

    });

    describe("Transient lifetime behavior", () => {

        test("should return different instances for each resolution", () => {

            DependecyService.RegisterFor(
                SampleServiceAbstract,
                SampleService,
                DIEscope.TRANSIENT
            );

            DependecyService.Register(ControllerTest);
            DependecyService.Register(AnotherService, DIEscope.TRANSIENT);

            const controller = DependecyService.Resolve(ControllerTest)!;

            const dependency = controller.SomeDepency;
            const scoped = DependecyService.Resolve(
                SampleServiceAbstract,
                controller
            );

            const inferred = DependecyService.Resolve(
                AnotherService,
                controller
            );

            expect(dependency).not.toBeUndefined();
            expect(dependency.Id).not.toBe(controller.AnotherDepency.Id);
            expect(dependency.Id).not.toBe(scoped?.Id);
            expect(inferred?.Id).not.toBe(controller.TypeInferedInjection?.Id);

        });

    });

    describe("Singleton lifetime behavior", () => {

        test("should return the same instance across all resolutions", () => {

            DependecyService.RegisterFor(
                SampleServiceAbstract,
                SampleService,
                DIEscope.SINGLETON
            );

            DependecyService.Register(ControllerTest);
            DependecyService.Register(AnotherService, DIEscope.SINGLETON);

            const controller = DependecyService.Resolve<ControllerTest>(
                ControllerTest
            )!;

            const dependency = controller.SomeDepency;

            const scoped1 = DependecyService.Resolve(
                SampleServiceAbstract,
                controller
            );

            const scoped2 = DependecyService.Resolve(SampleServiceAbstract);

            const inferred = DependecyService.Resolve(
                AnotherService,
                controller
            );

            expect(dependency).not.toBeUndefined();
            expect(dependency.Id).toBe(controller.AnotherDepency.Id);
            expect(dependency.Id).toBe(scoped1?.Id);
            expect(dependency.Id).toBe(scoped2?.Id);
            expect(controller.TypeInferedInjection?.Id).toBe(inferred?.Id);

        });

    });

    describe("Generic dependency injection", () => {

        test("should resolve a registered generic type", () => {

            const testService = DependecyService.ResolveGeneric(
                WithGenericType,
                TestClass
            );

            expect(testService instanceof TestClassService).toBeTruthy();
            expect(testService?._type).toBe(TestClass);

        });

        test("should resolve a derived generic type", () => {

            const derivedService = DependecyService.ResolveGeneric(
                WithGenericType,
                DerivedClass
            );

            expect(derivedService instanceof DerivedClassService).toBeTruthy();
            expect(derivedService?._type).toBe(DerivedClass);

        });

        test("should fallback to the default generic implementation when no mapping is found", () => {

            const randomTypeService = DependecyService.ResolveGeneric(
                WithGenericType,
                ItemTest
            );

            expect(randomTypeService instanceof WithGenericType).toBeTruthy();
            expect(randomTypeService?._type).toBe(ItemTest);

        });

    });

    describe("Concrete type resolution", () => {

        test("should resolve a concrete type without explicit mapping", () => {

            const concreteService = DependecyService.ResolveGeneric(
                ConcreteService
            );

            expect(concreteService instanceof ConcreteService).toBeTruthy();

        });

    });

});
