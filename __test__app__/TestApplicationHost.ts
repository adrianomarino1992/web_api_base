import "reflect-metadata";
import ExpressModule from "express";
import http, { Server } from "http";
import path from "path";
import net from "net";
import App from "./Application";
import Application from "../Application";
import ApplicationConfiguration from "../ApplicationConfiguration";
import AbstractMultiPartRequestService from "../files/AbstractMultiPartRequestService";
import FormidableMultiPartRequestService from "../files/FormidableMultiPartRequestService";
import BodyParseException from "../exceptions/BodyParseException";
import ControllersDecorators from "../decorators/controllers/ControllerDecorators";
import OwnMetaDataContainer from "../metadata/OwnMetaDataContainer";
import { ControllerBase } from "../controllers/base/ControllerBase";
import SampleController from "./controllers/SampleController";
import StatusController from "./controllers/StatusController";
import ResultsController from "./controllers/ResultsController";
import PathParamController, { SubExportController } from "./controllers/PathParamController";
import OmmitController from "./controllers/OmmitController";
import { NonDefaultExport2Controller, NonDefaultExportController } from "./controllers/NonDefaultExportController";
import FileController from "./controllers/file/FileController";
import SubFolderController from "./controllers/subfolder/SubFolderController";
import SubFolderWithNoNameController from "./controllers/subfolder/SubFolderWithNoNameController";
import AdmController from "./controllers/subfolder/onemorelevel/OneMoreLevelController";

export interface ITestApplicationHost
{
    app: App;
    server: Server;
    baseUrl: string;
    stopAsync(): Promise<void>;
}

class IntegrationApp extends App
{
    private RegisterController<T extends ControllerBase>(ctor: new (...args: any[]) => T, filePath: string): void
    {
        OwnMetaDataContainer.Set(ctor, ControllersDecorators.GetControllerPathKey(), undefined, filePath);
        this.AppendController(ctor);
    }

    protected override async RegisterControllersAsync(): Promise<void>
    {
        this.RegisterController(SampleController, path.join(__dirname, "controllers", "SampleController.ts"));
        this.RegisterController(StatusController, path.join(__dirname, "controllers", "StatusController.ts"));
        this.RegisterController(ResultsController, path.join(__dirname, "controllers", "ResultsController.ts"));
        this.RegisterController(PathParamController, path.join(__dirname, "controllers", "PathParamController.ts"));
        this.RegisterController(SubExportController, path.join(__dirname, "controllers", "PathParamController.ts"));
        this.RegisterController(OmmitController, path.join(__dirname, "controllers", "OmmitController.ts"));
        this.RegisterController(NonDefaultExportController, path.join(__dirname, "controllers", "NonDefaultExportController.ts"));
        this.RegisterController(NonDefaultExport2Controller, path.join(__dirname, "controllers", "NonDefaultExportController.ts"));
        this.RegisterController(FileController, path.join(__dirname, "controllers", "file", "FileController.ts"));
        this.RegisterController(SubFolderController, path.join(__dirname, "controllers", "subfolder", "SubFolderController.ts"));
        this.RegisterController(SubFolderWithNoNameController, path.join(__dirname, "controllers", "subfolder", "SubFolderWithNoNameController.ts"));
        this.RegisterController(AdmController, path.join(__dirname, "controllers", "subfolder", "onemorelevel", "OneMoreLevelController.ts"));
    }
}

export async function StartTestApplicationAsync(): Promise<ITestApplicationHost>
{
    const app = new IntegrationApp();
    const appConfig = app.ApplicationConfiguration as ApplicationConfiguration;

    appConfig.RootPath = path.resolve(__dirname);
    appConfig.CurrentWorkingDirectory = appConfig.RootPath;
    appConfig.ExecutablePath = path.join(appConfig.RootPath, "Index.ts");
    appConfig.DEBUG = false;
    appConfig.EnvFile = path.join(appConfig.RootPath, ".env.dev");

    await appConfig.LoadAsync();

    Application.Configurations = app.ApplicationConfiguration;

    app.Express.use(ExpressModule.json({ limit: 50 * 1024 * 1024 }));
    app.ApplicationConfiguration.AddScoped(AbstractMultiPartRequestService, FormidableMultiPartRequestService);

    await app.ConfigureAsync(app.ApplicationConfiguration);

    app.Express.use((_, response) => {
        response.status(404).end();
    });

    app.Express.use((error: unknown, _: unknown, response: any, next: () => void) => {
        if (error instanceof Error && error instanceof SyntaxError) {
            const exception = new BodyParseException(error.message);
            exception.stack = error.stack;
            response.status(500).json(exception);
            return;
        }

        next();
    });

    const server = await new Promise<Server>((resolve) => {
        const startedServer = http.createServer(app.Express);
        startedServer.listen(0, "127.0.0.1", () => resolve(startedServer));
    });

    const address = server.address() as net.AddressInfo;

    return {
        app,
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
        stopAsync: async () => {
            await new Promise<void>((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });
        }
    };
}
