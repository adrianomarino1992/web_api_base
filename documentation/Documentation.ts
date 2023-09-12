
import ControllersDecorators from "../decorators/controllers/ControllerDecorators";
import IController from "../interfaces/IController";
import JS from "./JS";



export default class Documentation {
    public CreateDocumentation(controllers: { new(...args: any[]): IController; }[]): void
    {
        let documentations : IDocument[] = [];

        for(let c of controllers)
        {

            
            let empty = new c() as any;
                
            let methods = Reflect.ownKeys(empty.constructor.prototype).filter(m => 
                {
                    return typeof empty[m] == "function" ;
                })     
    
            let route = ControllersDecorators.GetRoute(empty);
            

            for(let method of methods)
            {
                let action = ControllersDecorators.GetAction(empty, method.toString());

                if(!action){
                    continue;                
                }
                
                let verb = ControllersDecorators.GetVerb(empty, method.toString());
                let fromBody = ControllersDecorators.GetFromBodyArgs(empty.constructor, method.toString());
                let fromQuery = ControllersDecorators.GetFromQueryArgs(empty.constructor, method.toString());

                let doc : IDocument = 
                {
                    Id : 'id_' + controllers.indexOf(c), 
                    Route : `${route}${action}`,
                    Title : c.name,
                    Template : '', 
                    Verb : verb!.toString()
                }

                JS.Append(`AddResource(${JSON.stringify(doc)});`);

            }           
        }

        
    }
}

interface IDocument
{
    Id : string,
    Title : string,
    Route : string, 
    Template : string, 
    Verb : string,
}