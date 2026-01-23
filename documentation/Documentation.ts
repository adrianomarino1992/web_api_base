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
    public CreateDocumentation(controllersConstructors: { new(...args: any[]): IController; }[], app : Express): void
    {
        let documentations : IDocument[] = [];

        for(let ctor of controllersConstructors)
        {          
            
            let empty = new ctor();
            
                
            let methods = Type.GetAllMethods(ctor).map(s => s.name);
    
            let route = ControllersDecorators.GetRoute(ctor);
            let ignoreOnRoute = ControllersDecorators.GetOmmitOnRoute(ctor);

            if(ignoreOnRoute)
                route = "";
            
            let doc : IDocument = 
            {
                Id : 'c_' + documentations.length, 
                Route : route ?? "",
                Controller : ctor.name,
                Headers: [],
                Resources : [],                
            };
           
            doc.Headers = DocumentationDecorators.GetControllerHeaders(ctor);             

            for(let method of methods)
            {
                let action = ControllersDecorators.GetAction(ctor, method.toString());
                let ignoreActioName = ControllersDecorators.GetOmmitActionName(ctor, method.toString());

                if(!action)
                    continue;
                
                if(ignoreActioName)
                    action = "";
                
                let verb = ControllersDecorators.GetVerb(ctor, method.toString());
                let fromBody = ControllersDecorators.GetFromBodyArgs(ctor, method.toString());
                let fromQuery = ControllersDecorators.GetFromQueryArgs(ctor, method.toString());                
                let fromPath = ControllersDecorators.GetFromPathArgs(ctor, method.toString());                
                let fromFiles = ControllersDecorators.GetFromFilesArgs(ctor, method.toString());
                ControllersDecorators.GetNonDecoratedArguments(ctor, method, fromBody, fromQuery, fromPath, fromFiles);

                let template = DocumentationDecorators.GetRequestJson(ctor, method.toString());

                if(!template && fromBody.length > 0)
                {                    
                    template = JSON.stringify(Type.CreateTemplateFrom(fromBody[0].Type as new (...args: any[]) => any, {UseIgnoreProperty: true, UseJSONPropertyName: true}));
                }
                
                let description = DocumentationDecorators.GetDescription(ctor, method.toString());
                let actionHeaders = DocumentationDecorators.GetActionHeaders(ctor, method.toString());

                doc.Resources.push({

                    Description: description ?? "",
                    Id : `${doc.Id}-${doc.Resources.length}`,
                    Route : `${route}${action}`,
                    Verb : verb?.toString() ?? "GET",
                    Template : template ?? "", 
                    Response : DocumentationDecorators.GetProducesResponse(empty.constructor, method.toString()),
                    FromBody : fromBody.map(s => { return {Field : s.Field, Type : s.Type.name }}) , 
                    FromQuery : fromQuery.map(s => { return {Field : s.Field, Type : s.Type.name }}), 
                    FromPath : fromPath.map(s => { return {Field : s.Field, Type : s.Type.name }}), 
                    FromFiles : fromFiles.map(s => {return {FieldName: s.FileName}}), 
                    Headers : actionHeaders 
                });                          
               
            }   
            
             
            if(doc.Resources.length > 0)  
                documentations.push(doc); 
        }      

        if(documentations.length > 0)
        {
            for(let doc of documentations.sort((c, e) =>  c.Controller.toLowerCase().localeCompare(e.Controller.toLocaleLowerCase())))
            {
                JS.Append(`AddResource(${JSON.stringify(doc)});`);
            }

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

            if(Application.Configurations.DEBUG && process.argv.indexOf("--no-open") == -1 && process.argv.indexOf("--NO-OPEN") == -1)
            {
                let hostname = Application.Configurations.Host;

                if(hostname == "0.0.0.0")
                    hostname = "localhost"; 

                cmd.exec(`start "" "http://${hostname}:${Application.Configurations.Port}/playground"`, (error, stdout, stdin) => 
                {
                    if(error)
                        console.error(error);                
                });
            }
        }        
    }
}

interface IDocument
{
    Controller : string, 
    Id : string,
    Route : string,
    Headers : string[],
    Resources : 
    {
        Id : string,
        Description : string,
        Route : string, 
        Template : string, 
        Response : ReturnType<typeof DocumentationDecorators.GetProducesResponse>,
        Verb : string,
        FromQuery : {Field : string, Type : string }[], 
        FromPath : {Field : string, Type : string }[], 
        FromBody : {Field? : string, Type : string }[],
        FromFiles : {FieldName? : string }[],
        Headers : string[] 
    }[]
}