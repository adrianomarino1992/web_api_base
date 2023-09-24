import ControllersDecorators from "../decorators/controllers/ControllerDecorators";
import IController from "../interfaces/IController";
import HTML from "./HTML";
import JS from "./JS";
import CSS from "./CSS";
import Type from "../metadata/Type";
import { DocumentationDecorators } from "../decorators/documentation/DocumentationDecorators";
import { Express } from "express";
import cmd from 'child_process';
import Application from "../Application";

export default class Documentation {
    public CreateDocumentation(controllers: { new(...args: any[]): IController; }[], app : Express): void
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
            
            let doc : IDocument = 
            {
                Id : 'c_' + documentations.length, 
                Route : route ?? "",
                Controller : c.name,
                Resources : []
            };

            for(let method of methods)
            {
                let action = ControllersDecorators.GetAction(empty, method.toString());

                if(!action){
                    continue;                
                }
                
                let verb = ControllersDecorators.GetVerb(empty, method.toString());
                let fromBody = ControllersDecorators.GetFromBodyArgs(empty.constructor, method.toString());
                let fromQuery = ControllersDecorators.GetFromQueryArgs(empty.constructor, method.toString());                
                

                let template = DocumentationDecorators.GetRequestJson(empty, method.toString());

                if(!template && fromBody.length > 0)
                {                    
                    template = JSON.stringify(Type.CreateTemplateFrom(fromBody[0].Type as new (...args: any[]) => any));
                }
                
                let description = DocumentationDecorators.GetDescription(empty, method.toString());

                doc.Resources.push({

                    Description: description ?? "",
                    Id : `${doc.Id}-${doc.Resources.length}`,
                    Route : `${route}${action}`,
                    Verb : verb?.toString() ?? "GET",
                    Template : template ?? "", 
                    Response : DocumentationDecorators.GetProducesResponse(empty.constructor, method.toString()),
                    FromBody : fromBody.map(s => { return {Field : s.Field, Type : s.Type.name }}) , 
                    FromQuery : fromQuery.map(s => { return {Field : s.Field, Type : s.Type.name }})
                });                          
                
               
            }     

            if(doc.Resources.length > 0){

                JS.Append(`AddResource(${JSON.stringify(doc)});`);
                documentations.push(doc); 
            }
                 
        }

        if(documentations.length > 0)
        {
            JS.Save();
            HTML.Save();
            CSS.Save();

            app.get('/playground', (_, resp) => 
            {
                resp.sendFile(`${__dirname}\\index.html`);
            });
            app.get('/style.css', (_, resp) => 
            {
                resp.sendFile(`${__dirname}\\style.css`);
            });
            app.get('/script.js', (_, resp) => 
            {
                resp.sendFile(`${__dirname}\\script.js`);
            });

            console.log(Application.Configurations);
            cmd.exec(`start "" "http://${Application.Configurations.Host}:${Application.Configurations.Port}/playground"`, (error, stdout, stdin) => 
            {
                if(error)
                    console.error(error);                
            });
        }        
    }
}

interface IDocument
{
    Controller : string, 
    Id : string,
    Route : string,
    Resources : 
    {
        Id : string,
        Description : string,
        Route : string, 
        Template : string, 
        Response : ReturnType<typeof DocumentationDecorators.GetProducesResponse>,
        Verb : string,
        FromQuery : {Field : string, Type : string }[], 
        FromBody : {Field? : string, Type : string }[]  
    }[]
}