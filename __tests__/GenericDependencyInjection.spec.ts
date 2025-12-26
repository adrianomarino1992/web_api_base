import DependecyService from "../dependencyInjection/DependecyService";
import { DIEscope } from "../dependencyInjection/DependecyService";
import GenericService from "./classes/GenericService";
import ControllerWithGenericProperty from "./classes/ControllerWithGenericProperty";
import TestClass, { DerivedClass } from "./classes/TestClass";

describe("Dependency Injection service – generic resolution", () => {

    test("should create a generic dependency for a specific type", () => {

        DependecyService["_services"] = [];

        DependecyService.RegisterGeneric(
            GenericService,
            undefined,
            undefined,
            DIEscope.SCOPED,
            (t) => new GenericService<typeof t>(
                t as new (...args: any[]) => typeof t
            )
        );

        const dependency = DependecyService.ResolveGeneric(
            GenericService<TestClass>,
            TestClass
        );

        expect(dependency).not.toBeNull();

        const testClass = new TestClass(
            "developer",
            32,
            true,
            new Date(),
            "",
            1
        );

        const result = dependency?.Run([testClass]);

        expect(result).not.toBeNull();
        expect(result?.length).toBe(1);
        expect(result![0].constructor).toBe(TestClass);

    });

    test("should create different generic dependencies for different types", () => {

        DependecyService["_services"] = [];

        DependecyService.RegisterGeneric(
            GenericService,
            undefined,
            undefined,
            DIEscope.SCOPED,
            (t) => new GenericService<typeof t>(
                t as new (...args: any[]) => typeof t
            )
        );

        const dependency1 = DependecyService.ResolveGeneric(
            GenericService<TestClass>,
            TestClass
        );

        const dependency2 = DependecyService.ResolveGeneric(
            GenericService<TestClass>,
            DerivedClass
        );

        expect(dependency1).not.toBeNull();
        expect(dependency2).not.toBeNull();
        expect(dependency1).not.toBe(dependency2);
        expect(dependency1?.GetType()).not.toBe(dependency2?.GetType());

    });

    test("should create a generic dependency applicable to all types", () => {

        DependecyService["_services"] = [];
        DependecyService.Register(GenericService);

        const dependency = DependecyService.Resolve(
            GenericService<TestClass>
        );

        expect(dependency).not.toBeNull();

        const testClass = new TestClass(
            "developer",
            32,
            true,
            new Date(),
            "",
            1
        );

        const result = dependency?.Run([testClass]);

        expect(result).not.toBeNull();
        expect(result?.length).toBe(1);
        expect(result![0].constructor).toBe(TestClass);

    });

    test("should create a controller with generic dependencies", () => {

        DependecyService["_services"] = [];

        const controller = DependecyService.Resolve(
            ControllerWithGenericProperty
        );

        expect(controller).not.toBeNull();

    });

    test(
        "should inject a generic dependency when no specific type is provided during registration",
        () => {

            DependecyService["_services"] = [];
            DependecyService.Register(GenericService);

            const controller = DependecyService.Build(
                ControllerWithGenericProperty
            );

            expect(controller).not.toBeNull();

            const dependency = controller.GenericDependecy;

            const testClass = new TestClass(
                "developer",
                32,
                true,
                new Date(),
                "",
                1
            );

            const result = dependency?.Run([testClass]);

            expect(result).not.toBeNull();
            expect(result?.length).toBe(1);
            expect(result![0].constructor).toBe(TestClass);

        }
    );

    test(
        "should inject a generic dependency when the type is provided during registration",
        () => {

            DependecyService["_services"] = [];

            DependecyService.RegisterGeneric(
                GenericService,
                undefined,
                undefined,
                DIEscope.SCOPED,
                (t) => new GenericService<typeof t>(
                    t as new (...args: any[]) => typeof t
                )
            );

            const controller = DependecyService.Build(
                ControllerWithGenericProperty
            );

            expect(controller).not.toBeNull();

            const dependency = controller.GenericDerivedDependecy;

            const derived = new DerivedClass(
                "developer",
                32,
                true,
                new Date(),
                "",
                1,
                "hash"
            );

            const result = dependency?.Run([derived]);

            expect(result).not.toBeNull();
            expect(result?.length).toBe(1);
            expect(result![0].constructor).toBe(DerivedClass);

        }
    );

});
