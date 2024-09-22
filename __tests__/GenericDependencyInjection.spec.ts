import DependecyService from "../dependencyInjection/DependecyService";
import { DIEscope } from "../dependencyInjection/DependecyService";
import GenericService from './classes/GenericService';
import ControllerWithGenericProperty from './classes/ControllerWithGenericProperty'
import TestClass, { DerivedClass } from "./classes/TestClass";



describe("Testing the dependecy injection service", ()=>{
        
    test("Testing the creation of generic dependecy", ()=>
    {
        DependecyService["_services"] = [];
        DependecyService.RegisterGeneric(GenericService, undefined, undefined, DIEscope.SCOPED, 
        (t)=>
        {
                return new GenericService<typeof t>(t as new (...args:any[]) => typeof t);
        });
       
            
        let dependecy = DependecyService.ResolveGeneric(GenericService<TestClass>, TestClass);

        expect(dependecy).not.toBeNull();

        let testClass = new TestClass("developer", 32, true, new Date(), "", 1);

        let result = dependecy?.Run([testClass]);

        expect(result).not.toBeNull();
        expect(result?.length).toBe(1);
        expect(result![0].constructor == TestClass).toBeTruthy();
    
    });

    test("Testing the creation of generics dependecies", ()=>
    {
        DependecyService["_services"] = [];
        DependecyService.RegisterGeneric(GenericService, undefined, undefined, DIEscope.SCOPED, 
        (t)=>
        {
                return new GenericService<typeof t>(t as new (...args:any[]) => typeof t);
        });
    
        let dependecy1 = DependecyService.ResolveGeneric(GenericService<TestClass>, TestClass);
        let dependecy2 = DependecyService.ResolveGeneric(GenericService<TestClass>, DerivedClass);

        expect(dependecy1).not.toBeNull();
        expect(dependecy2).not.toBeNull();
        expect(dependecy1).not.toBe(dependecy2);
        expect(dependecy1?.GetType()).not.toBe(dependecy2?.GetType());         
        
        
    });

    test("Testing the creation of generics dependecy for all types", ()=>
    {
        DependecyService["_services"] = [];
        DependecyService.Register(GenericService);        

        let dependecy = DependecyService.Resolve(GenericService<TestClass>);

        expect(dependecy).not.toBeNull();

        let testClass = new TestClass("developer", 32, true, new Date(), "", 1);

        let result = dependecy?.Run([testClass]);

        expect(result).not.toBeNull();
        expect(result?.length).toBe(1);
        expect(result![0].constructor == TestClass).toBeTruthy();       
            
    });

    

    test("Testing the creation of a controller", ()=>
    {
        DependecyService["_services"] = [];
        let controller = DependecyService.Resolve(ControllerWithGenericProperty);
    
        expect(controller).not.toBeNull();
        
    });


    
    test("Testing the inject decorator with generics types and no type provided on register", ()=>
    {
        DependecyService["_services"] = [];
        DependecyService.Register(GenericService);        

        let controller = DependecyService.Build(ControllerWithGenericProperty);

        expect(controller).not.toBeNull();

        let dependecy = controller.GenericDependecy;

        let testClass = new TestClass("developer", 32, true, new Date(), "", 1);

        let result = dependecy?.Run([testClass]);

        expect(result).not.toBeNull();
        expect(result?.length).toBe(1);
        expect(result![0].constructor == TestClass).toBeTruthy();       
            
    });


    test("Testing the inject decorator with generics types with type provided in register", ()=>
    {
              
        DependecyService["_services"] = [];
        DependecyService.RegisterGeneric(GenericService, undefined, undefined, DIEscope.SCOPED, 
        (t)=>
        {
                return new GenericService<typeof t>(t as new (...args:any[]) => typeof t);
        });
        let controller = DependecyService.Build(ControllerWithGenericProperty);

        expect(controller).not.toBeNull();

        let dependecy = controller.GenericDerivedDependecy;   

        let derived = new DerivedClass("developer", 32, true, new Date(), "", 1, "hash");

        let result = dependecy?.Run([derived]);

        expect(result).not.toBeNull();
        expect(result?.length).toBe(1);
        expect(result![0].constructor == DerivedClass).toBeTruthy();       
            
    });




});