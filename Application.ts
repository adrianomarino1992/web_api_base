import { Express, static as static_ } from "express";
import ExpressModule from "express";
import ApplicationConfiguration from "./ApplicationConfiguration"
import IApplication, { ApplicationExceptionHandler } from "./interfaces/IApplication";
import IApplicationConfiguration from "./interfaces/IApplicationConfiguration";
import IController from "./interfaces/IController";
import ControllersDecorators from './decorators/controllers/ControllerDecorators';
import DependecyService from './dependencyInjection/DependecyService';
import { HTTPVerbs } from "./enums/httpVerbs/HttpVerbs";
import { Request, Response } from "express";
import File from 'fs';
import Path from 'path';
import IMidleware, { IHTTPRequestContext, IRequestResultHandler } from "./midlewares/IMidleware";
import ValidationDecorators from "./decorators/validations/ValidationDecorators";
import ControllerLoadException from "./exceptions/ControllerLoadException";
import Exception from "./exceptions/Exception";
import Documentation from "./documentation/Documentation";
import { ControllerBase } from "./controllers/base/ControllerBase";
import ActionResult from "./controllers/ActionResult";
import BodyParseException from "./exceptions/BodyParseException";
import AbstractMultiPartRequestService, { IRequestPart, PartType } from "./files/AbstractMultiPartRequestService";
import FormidableMultiPartRequestService from "./files/FormidableMultiPartRequestService";
import FileClass from './files/File';
import Type from "./metadata/Type";
import SendFileResult from "./controllers/SendFileResult";
import DownloadFileResult from "./controllers/DownloadFileResult";
import OwnMetaDataContainer from "./metadata/OwnMetaDataContainer";
import MaxFileSizeException from "./exceptions/MaxFileSizeException";


export default abstract class Application implements IApplication {

    public static Configurations: IApplicationConfiguration;

    private _createdControllers: { new(...args: any[]): IController }[] = [];

    private _URIs : {URI: string, Controller: string, Verb : HTTPVerbs}[] = [];

    public ApplicationConfiguration: IApplicationConfiguration;

    public Express: Express;

    public ApplicationThreadExeptionHandler?: ApplicationExceptionHandler;

    constructor() {

        this.ApplicationConfiguration = new ApplicationConfiguration();

        this.Express = ExpressModule();

    }


    public async StartAsync(): Promise<void> {
        await (this.ApplicationConfiguration as ApplicationConfiguration).LoadAsync();

        Application.Configurations = this.ApplicationConfiguration;

        this.Express.use(ExpressModule.json({ limit: 50 * 1024 * 1024 }));  
        
        this.ApplicationConfiguration.AddScoped(AbstractMultiPartRequestService, FormidableMultiPartRequestService);

        await this.ConfigureAsync(this.ApplicationConfiguration);

        if(this.ApplicationConfiguration)
            this.Express.use((e : any, rq : any, rs : any, n : any) => 
            {
                if(e && e instanceof Error && e instanceof SyntaxError)
                {
                    let b = new BodyParseException(e.message);
                    b.stack = e.stack;
                    this.CallErrorHandler(rq, rs, b);
                }
                else
                    n();                    
            });        

        this.Express.listen(this.ApplicationConfiguration.Port, this.ApplicationConfiguration.Host, () => {
            console.log(`Application running on ${this.ApplicationConfiguration.Host}:${this.ApplicationConfiguration.Port}`);
        });

       
    }

    protected UseCors(): void {
        this.Express.use(require('cors')());
    }


    
    public UseStatic(path: string, folder: string)
    {
        if(!folder)
            throw new Exception("Folder is required to create a static folder");

        let folderPath = folder.startsWith("/") ? Path.join(this.ApplicationConfiguration.RootPath, folder) : folder;
        this.Express.use(path, static_(folderPath));
    }

    public Use(midleware: IMidleware): void 
    {
        this.ApplicationConfiguration.Use(midleware);    
    }
    
    public Run(resultHandler: IRequestResultHandler): void 
    {
        this.ApplicationConfiguration.Run(resultHandler);
    }

    private GetIgnoredPaths(): string[] {
        return [
            ".git",
            ".vscode",
            "coverage",
            "node_modules"
        ]
    }

    private TryFindControllerFolder(path: string): string | undefined {

        if (this.GetIgnoredPaths().filter(s => path.endsWith(s)).length > 0)
            return undefined;

        if (path.indexOf("node_modules") > -1)
            return undefined;

        if (!File.existsSync(path))
            return undefined;

        if (File.readdirSync(path).filter(s => s.toLowerCase().endsWith("controller.js")).length > 0)
            return path;

        let folder = File.readdirSync(path).filter(s => !File.lstatSync(Path.join(path, s)).isFile());

        if (folder.length == 0)
            return undefined;

        for (let f of folder) {
            let find = this.TryFindControllerFolder(Path.join(path, f));

            if (find && find.toLowerCase().endsWith("controllers"))
                return find;

        }

        return undefined;
    }

    protected GetAllControllersFilesRecursively(dir: string) : string[]
    {
        let controllersPaths : string[] = [];

        let itens = File.readdirSync(dir, {withFileTypes: true });

        for(let item of itens)
        {
            let fullPath = Path.join(dir, item.name);

            if(item.isDirectory())
            {
                controllersPaths.push(...this.GetAllControllersFilesRecursively(fullPath));
            }
            else if(fullPath.toLowerCase().endsWith("controller.js"))
            {
               controllersPaths.push(fullPath);
            }    
        }

        return controllersPaths;
    }

    protected UseControllersAsync(root?: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {

            let controllersPath: string | undefined = this.TryFindControllerFolder(Path.join(root ?? this.ApplicationConfiguration.RootPath, "controllers"));

            if (!controllersPath)
                controllersPath = this.TryFindControllerFolder(root ?? this.ApplicationConfiguration.RootPath);

            if (!controllersPath || !File.existsSync(controllersPath!))
                return reject(new ControllerLoadException( `No controller directory was found. If you intend to register controllers manually, remove the call to ${this.UseControllersAsync.name}.`));


            console.debug(`reading controllers in ${controllersPath}`);

            let files: string[] = this.GetAllControllersFilesRecursively(controllersPath);

            if(files.length == 0)
                  return reject(new ControllerLoadException(`No controllers were found in the specified directory: ${controllersPath}. If you intend to register controllers manually, remove the call to ${this.UseControllersAsync.name}.`));

            for (let controllerFile of files) 
            {
                let controllerModule = await import(controllerFile);
               
                let controllersCtors : Function[] = []

                for (let c in controllerModule) 
                {
                    if (c.toLowerCase().endsWith("controller")) 
                    {
                            let t = controllerModule[c];
                            if(typeof t == 'function')
                                controllersCtors.push(t);
                    }
                }

                if (controllerModule.default != undefined) 
                {
                    controllersCtors.push(controllerModule.default);
                } 

                for(let cTor of controllersCtors)
                {                    
                    if (cTor == undefined)
                        continue;                  
                    
                    let controller = Reflect.construct(cTor.prototype.constructor, []) as IController;
    
                    if (controller != undefined && controller != null) 
                    {
                        if(controller instanceof ControllerBase){
                            OwnMetaDataContainer.Set(cTor.prototype.constructor, ControllersDecorators.GetControllerPathKey(), undefined, controllerFile);
                            this.AppendController(cTor.prototype.constructor);    
                        }                   
    
                    } 

                }
            }

            resolve();


        })


    }

    protected UseCustomMultiPartRequestHandler<T extends AbstractMultiPartRequestService>(cTor : new (...args: any[]) => T) : void
    {
        this.ApplicationConfiguration.AddScoped(AbstractMultiPartRequestService, cTor);
    }

    protected AppendController<T extends ControllerBase>(ctor: { new(...args: any[]): T; }): void {
    

        let methods = Type.GetAllMethods(ctor).map(s => s.name);

        let route = ControllersDecorators.GetRoute(ctor);
        let validateBody = ControllersDecorators.IsToValidate(ctor);
        let ignoreRouteName = ControllersDecorators.GetOmmitOnRoute(ctor);
        
        if(ignoreRouteName)
            route = '';


        this._createdControllers.push(ctor);

        for (let method of methods) {
            let action = ControllersDecorators.GetAction(ctor, method.toString());

            if (!action) {
                continue;
            }

            let verb = ControllersDecorators.GetVerb(ctor, method.toString());
            let fromBody = ControllersDecorators.GetFromBodyArgs(ctor, method.toString());
            let fromQuery = ControllersDecorators.GetFromQueryArgs(ctor, method.toString());
            let fromFiles = ControllersDecorators.GetFromFilesArgs(ctor, method.toString());
            let fromPath = ControllersDecorators.GetFromPathArgs(ctor, method.toString());
            let maxFilesSize = ControllersDecorators.GetMaxFilesSize(ctor);
            let maxFileSizeOfAction = ControllersDecorators.GetMaxFileSize(ctor, method.toString());


            let ignoreActioName = ControllersDecorators.GetOmmitActionName(ctor, method.toString());

            if(ignoreActioName)
                action = "";

            ControllersDecorators.GetNonDecoratedArguments(ctor, method, fromBody, fromQuery, fromPath, fromFiles);

            fromQuery.push(...fromPath) //path params will work like a query param after this point 
            
            if (!verb)
                verb = HTTPVerbs.GET;            

            if(verb == HTTPVerbs.GET && fromBody.length > 0)
                throw new ControllerLoadException(`GET method: ${ctor.name}.${method.toString()} can not have body params`);

            if(verb != HTTPVerbs.POST && fromFiles.length > 0)
                throw new ControllerLoadException(`Method: ${ctor.name}.${method.toString()} must be a POST method to allow File type parameters`);

            let collision = this._URIs.filter(s => s.URI == `${route}${action}` && s.Verb == verb);
            
            if(collision.length > 0)
                throw new ControllerLoadException(`The URI: ${verb.toString().toUpperCase()} ${route}${action} exists in two controllers: ${collision[0].Controller} and ${ctor.name}.${method.toString()}`);

            console.debug("appended : ", verb, `${route}${action}`);

            let pathParams = '';
        
            if(fromPath)
            {
                if(action.endsWith('/'))
                    action = action.substring(0, action.length - 1);
                
                for(let path of fromPath)
                {
                    if(action.indexOf(`:${path.Field}`) == -1 && route.indexOf(`:${path.Field}`) == -1)                        
                        pathParams+= `/:${path.Field}`;  
                                      
                }
            }

            if(ignoreRouteName && ignoreActioName && !pathParams)
                action = "/";

            if(!this.IsValidExpressRoute(`${route}${action}${pathParams.trim()}`))
                throw new ControllerLoadException(`The URI: ${verb.toString().toUpperCase()} ${route}${action} of ${ctor.name}.${method.toString()} is invalid`);
 

            this._URIs.push({ URI : `${route}${action}`, Controller : `${ctor.name}.${method.toString()}`, Verb : verb});

            (this.Express as any)[verb.toString().toLowerCase()](`${route}${action}${pathParams.trim()}`, async (request: Request, response: Response) => {

                let midlewares = [...(this.ApplicationConfiguration as ApplicationConfiguration).GetMidlewares()];
                
                midlewares.push(...ControllersDecorators.GetMidlewares(ctor).map(s => s).reverse());

                midlewares.push(...ControllersDecorators.GetBefores(ctor, method.toString()).map(s => s).reverse());

                let afters = [...ControllersDecorators.GetMidlewaresAfter(ctor).map(s => s).reverse()];

                afters.push(...ControllersDecorators.GetAfters(ctor, method.toString()).map(s => s).reverse());

                afters.push(...(this.ApplicationConfiguration as ApplicationConfiguration).GetResultHandlers());

                let handler = async (context: IHTTPRequestContext) => {                   
                               

                    let params: any[] = [];

                    let ts = ((Reflect.getMetadata("design:paramtypes", ctor, method.toString()) ??
                        Reflect.getMetadata("design:paramtypes", ctor.prototype, method.toString())) ?? []) as Function[]; 

                    let content_type= request.headers["content-type"];

                    let isMultiPartFormData = content_type && content_type.indexOf('multipart/form-data') > -1;
                    let isJSONData = content_type && content_type.indexOf('application/json') > -1;

                    if((verb == HTTPVerbs.POST || verb == HTTPVerbs.PUT) && !isJSONData && !isMultiPartFormData)
                    {
                        response.status(400);
                        response.json(
                            {
                                Message: "Model binding fail",
                                Detailts: "To send data using a PUT or POST method the correct content-type header is required"
                            });
                    }

                    let parts : IRequestPart[] = [];
                    let fromFilesParams: any[] = [];
                    if(isMultiPartFormData)
                    {
                        let multiPartService = DependecyService.Resolve<AbstractMultiPartRequestService>(AbstractMultiPartRequestService);
                        
                        try{

                            let maxFileSizeInBytes = 0;

                            if(maxFileSizeOfAction)
                                maxFileSizeInBytes = maxFileSizeOfAction.MaxFileSize;
                            else if(maxFilesSize)
                                maxFileSizeInBytes = maxFilesSize.MaxFileSize;

                            parts = await multiPartService!.GetPartsFromRequestAsync(request, { MaxFileSize: maxFileSizeInBytes});

                        }catch (err) {

                            if(err instanceof MaxFileSizeException)
                            {
                                 let maxFileSizeErroMessage = err.Message;

                                if(maxFileSizeOfAction && maxFileSizeOfAction.FileBiggerThanMaxMessage)
                                    maxFileSizeErroMessage = maxFileSizeOfAction.FileBiggerThanMaxMessage;
                                else if(maxFilesSize && maxFilesSize.FileBiggerThanMaxMessage)
                                    maxFileSizeErroMessage = maxFilesSize.FileBiggerThanMaxMessage;

                                response.status(413);
                                response.json(
                                            {
                                                Message: "Model binding fail",
                                                Detailts: maxFileSizeErroMessage
                                            });
                                return;
                                
                            }
                            return this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                        }

                        for(let f of fromFiles)
                        {
                            let fs = parts?.filter(s => s.Type == PartType.FILE);

                            if(fs.length > 0)
                            {
                                if(f.FileName){

                                    let files = fs.filter(s => s.Filename == f.FileName);
    
                                    if(files.length > 0)
                                    {
                                        let fileClass = new FileClass(files[0].Filename!, files[0].Content);
                                        fromFilesParams.push(fileClass);
                                        params[f.Index] = fileClass;
                                    }
                                    
                                }else{
    
                                    let fileClass = new FileClass(fs[0].Filename!, fs[0].Content);
                                    fromFilesParams.push(fileClass);
                                    params[f.Index] = fileClass;
                                }
                            }
                            
                        }
                    }

                    

                    let fromBodyParams: any[] = [];
                    if (fromBody.length > 0) {
                        fromBody.sort((a, b) => a.Index - b.Index).forEach(f => {
                            let obj = undefined;

                            if (!f.Field || f.Type.name == "Object")
                            {
                                let fieldParts = parts.filter(s => s.Name == 'body');

                                if(isMultiPartFormData && fieldParts.length > 0)
                                {
                                    try
                                    {
                                        obj = JSON.parse(fieldParts[0].Content);
                                    }
                                    catch
                                    {
                                        obj = fieldParts[0].Content;
                                    }

                                }else
                                {
                                    obj = request.body;
                                }
                                
                            }
                            else
                            {

                                let fieldParts = parts.filter(s => s.Name == f.Field);
                                
                                if(isMultiPartFormData && fieldParts.length > 0)
                                {
                                    try
                                    {
                                        obj = JSON.parse(fieldParts[0].Content);
                                    }
                                    catch
                                    {
                                        obj = fieldParts[0].Content;
                                    }


                                }else{
                                    obj = request.body[f.Field];
                                }
                                    
                            }
                                
                            if(!obj || JSON.stringify(obj) == "{}")
                            {
                                fromBodyParams.push(undefined);
                                params[f.Index] = undefined;
                                return;       
                            }

                            let param = Type.SetPrototype(obj, ts[f.Index] as new (...args: any[]) => any, {UseJSONPropertyName: true});
                            fromBodyParams.push(param);
                            params[f.Index] = param;
                            return;       

                        });
                    }

                    let fromQueryParams: any[] = [];
                    if (fromQuery.length > 0) {
                        fromQuery.sort((a, b) => a.Index - b.Index).forEach((f, j) => {
                            let obj: string | undefined;

                            if(f.Field == '')
                            {
                                let j = 0;
                                for(let k in request.query)
                                {
                                    if(j == f.Index)
                                        f.Field = k;
                                }
                            }

                            if(f.Field == '')
                            {
                                params[f.Index] = undefined;
                                return;
                            }

                            if(request.query[f.Field])
                                obj = request.query[f.Field]?.toString();
                            else if(request.params[f.Field])
                                obj = request.params[f.Field]?.toString();
                                

                            let param = Type.SetPrototype(obj, ts[f.Index] as new (...args: any[]) => any, {UseJSONPropertyName: true});
                            fromQueryParams.push(param);
                            params[f.Index] = param;
                            return;
                        });
                    }


                    if (validateBody) {

                        if (fromBody.length > 0) {
                            let modelBindErros = [];

                            for (let p of fromBody) {
                                if (p.Required && (params.length <= p.Index || params[p.Index] == undefined)) {
                                    modelBindErros.push(p);
                                }
                                else
                                {
                                    if(!p.Required && params[p.Index] == undefined)
                                        continue;

                                    try{
                                        Type.ValidateType(params[p.Index], ts[p.Index] as new (...args: any[]) => any);
                                    }catch(e)
                                    {
                                        response.status(400);
                                        response.json(
                                            {
                                                Message: "Model binding fail",
                                                Detailts: (e as any).message
                                            });
                                        return;
                                    }
                                }
                            }

                            if (modelBindErros.length > 0) {
                                response.status(400);
                                response.json(
                                    {
                                        Message: "Model binding fail",
                                        Detailts: modelBindErros.map(s => s.NotProvidedMessage ? s.NotProvidedMessage :  `Parameter "${s.Field}" is required`)
                                    });
                                return;
                            }

                        }

                        if (fromQuery.length > 0) {
                            let modelBindErros = [];

                            for (let p of fromQuery) {
                                if (p.Required && (params.length <= p.Index || params[p.Index] == undefined)) {
                                    modelBindErros.push(p);
                                }
                            }

                            if (modelBindErros.length > 0) {
                                response.status(400);
                                response.json(
                                    {
                                        Message: "Model binding fail",
                                        Detailts: modelBindErros.map(s => s.NotProvidedMessage ? s.NotProvidedMessage : `Parameter "${s.Field}" is required`)
                                    });
                                return;
                            }

                        }

                        if (fromFiles.length > 0) {
                            let modelBindErros = [];

                            for (let p of fromFiles) {
                                if (p.Required && (params.length <= p.Index || params[p.Index] == undefined)) {
                                    modelBindErros.push(p);
                                }
                            }

                            if (modelBindErros.length > 0) {
                                response.status(400);
                                response.json(
                                    {
                                        Message: "Model binding fail",
                                        Detailts: modelBindErros.map(s =>  s.NotProvidedMessage ? s.NotProvidedMessage : `The file ${(s.FileName ? `"${s.FileName} "` : "")}is required`)
                                    });
                                return;
                            }

                        }

                        let validationsErrors: string[] = [];

                        for (let a of fromBodyParams) {
                           try{
                            validationsErrors.push(...ValidationDecorators.Validate<typeof a>(a).map(s => s.Message));
                           }catch{}
                        }

                        if (validationsErrors.length > 0) {
                            response.status(400);
                            response.json(
                                {
                                    Message: "Validation fail",
                                    Detailts: validationsErrors
                                });
                            return;
                        }
                    }


                    let controller : ControllerBase;

                    try {

                        controller = DependecyService.ResolveCtor(ctor) as ControllerBase;

                        if (controller == undefined)
                            controller = new ctor() as ControllerBase;

                        DependecyService.CheckForDependenciesAndResolve(controller);

                    } 
                    catch (err) 
                    {
                        return this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                    }


                    controller.Request = context.Request;
                    controller.Response = context.Response;

                    try {

                        let exceutionTask = (controller as any)[method](...params);

                        if (exceutionTask instanceof Promise) {

                            try{

                                let c = await exceutionTask;

                                for (let afterHandler of afters) {

                                    try{

                                        await afterHandler(
                                            {
                                                Request: request,
                                                Response: response,
                                                Result: c
                                            });

                                    }catch(subErr)
                                    {
                                        return this.CallErrorHandler(request, response, this.CastToExpection(subErr as Error));
                                    }
                                    
                                }

                                this.SendResponseIfNecessary(controller, response, c);

                            }catch(err)
                            {
                                for (let afterHandler of afters) {

                                    try{
                                        await afterHandler(
                                            {
                                                Exception: this.CastToExpection(err as Error),
                                                Request: request,
                                                Response: response
                                            });
                                    }catch(subErr)
                                    {
                                        return this.CallErrorHandler(request, response, this.CastToExpection(subErr as Error));
                                    }
                                }

                                if (afters.length == 0)
                                    this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                                if(!response.headersSent)
                                    this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                            }
                           

                        }
                        else {

                            for (let afterHandler of afters) {
                                try {
                                    await afterHandler(
                                        {
                                            Request: request,
                                            Response: response,
                                            Result: exceutionTask
                                        });
                                } catch (err) {
                                    this.CallErrorHandler(request, response, this.CastToExpection(err as Error))
                                }
                            }

                            this.SendResponseIfNecessary(controller, response, exceutionTask);                          

                        }



                    }
                    catch (err) {
                        for (let afterHandler of afters) {
                            try {

                                await afterHandler(
                                    {
                                        Exception: this.CastToExpection(err as Error),
                                        Request: request,
                                        Response: response
                                    });

                            } catch (subErr) {
                                this.CallErrorHandler(request, response, this.CastToExpection(subErr as Error));
                            }
                        }

                        if (afters.length == 0)
                            this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                        if(!response.headersSent)
                            this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                    }
                }

                if (midlewares && midlewares.length > 0) {

                    let httpRequestContexts: IHTTPRequestContext[] = [];

                    let pipeline: any[] = [];

                    for (let i = 0; i <= midlewares.length; i++) {

                        httpRequestContexts.push(
                            {
                                Request: request,
                                Response: response,
                                Next: async () => { }
                            });

                    }

                    for (let i = 0; i < httpRequestContexts.length; i++) {
                        let box =
                        {
                            v: i
                        };


                        pipeline.push(
                            {
                                Execute: async () => {

                                    try{

                                        pipeline.length - 1 == box.v ? await handler(httpRequestContexts[box.v]) : await midlewares[box.v](httpRequestContexts[box.v])
                                    }
                                    catch(err)
                                    {
                                        this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                                    }
                                }
                            });
                    }

                    for (let i = 0; i < pipeline.length; i++) {
                        
                        httpRequestContexts[i].Next = i == pipeline.length - 1 ? async () => { } : async () => 
                        {
                            try{

                                await pipeline[i + 1].Execute();
                                                        }
                            catch(err)
                            {
                                this.CallErrorHandler(request, response, this.CastToExpection(err as Error));
                            }
                            
                        }
                    }


                    await pipeline[0].Execute();
                }
                else {

                    await handler({
                        Request: request,
                        Response: response,
                        Next: async () => { }
                    });

                }


            })
        }

    }

    public CreateDocumentation(): void {
        new Documentation().CreateDocumentation(this._createdControllers, this.Express);
    }

    private SendResponseIfNecessary(controller : ControllerBase, response : Response, result : any) : void
    {
        if(response.headersSent)return;

        if(!result)
        {           
            controller.SendResponse(204); 
            return;
        }

        if(result instanceof ActionResult)
        {
            if(result.constructor.name == SendFileResult.name)
            {                
                controller.Response.sendFile(result.Result)
                return;
            }

            if(result.constructor.name == DownloadFileResult.name)
            {                
                controller.Response.download(result.Result)
                return;
            }

            controller.SendResponse(result.StatusCode, result.Result);
            return;
        }

        controller.SendResponse(200, result);       

    }

    private CastToExpection(err: Error): Exception {
        let ex: Exception | undefined;

        if (err instanceof Exception)
            ex = err;
        else {
            ex = new Exception(err?.message?? "Unknown error");
            ex.stack = err?.stack ?? "";
        }

        return ex;
    }

    private CallErrorHandler(request: Request, response: Response, exception: Error) {
        let defaultHandler = (request: Request, response: Response, exception: Exception): void => {
            try {
                if(response.headersSent)return;
                response.status(500);
                response.json(exception);

            } catch (err) {
                console.log("Error while trying handle the error");
                console.log(err);

            } finally {
                console.log("Inner exception");
                console.log(exception);
            }
        }

        if (this.ApplicationThreadExeptionHandler != undefined) {
            try {
                this.ApplicationThreadExeptionHandler!(request, response, this.CastToExpection(exception));

            } catch (err) {
                console.log("Error while trying handle the error with custom delegate");
                console.log(err);
                defaultHandler(request, response, this.CastToExpection(err as Error));
            }
        } else {
            defaultHandler(request, response, this.CastToExpection(exception));
        }
    }


    private IsValidExpressRoute(route: string): boolean {

        if (!route || typeof route !== 'string') 
            return false;

        if (!route.startsWith('/')) 
            return false;

        const expressRouteRegex =
            /^\/([A-Za-z0-9\-._~%!$&'()+,;=:@]+|\*|:[A-Za-z0-9_]+[?*+]?)?(\/([A-Za-z0-9\-._~%!$&'()+,;=:@]+|\*|:[A-Za-z0-9_]+[?*+]?)?)*$/;

        return expressRouteRegex.test(route);
    }




    public abstract ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void>;


}


