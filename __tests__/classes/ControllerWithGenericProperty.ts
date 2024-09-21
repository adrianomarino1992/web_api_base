import {Inject, ControllerBase, Route, InjectTypeArgument} from '../../index';
import GenericService  from './GenericService';
import TestClass, { DerivedClass } from './TestClass';

@Route("/test")
export default class ControllerTest extends ControllerBase
{

    @Inject()
    public GenericDependecy : GenericService<TestClass>;  

    @InjectTypeArgument(DerivedClass)
    public GenericDerivedDependecy : GenericService<DerivedClass>;


    constructor(some : GenericService<TestClass>, derived : GenericService<DerivedClass>)
    {
        super();
        this.GenericDependecy = some;
        this.GenericDerivedDependecy = derived;
       
    }

    public Get(list: TestClass[]) : TestClass[]
    {
        return this.GenericDependecy.Run(list);
    }

}