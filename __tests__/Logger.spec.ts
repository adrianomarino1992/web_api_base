import { describe, expect, jest, test } from "@jest/globals";
import ApplicationConfiguration from "../ApplicationConfiguration";
import { DefaultApplicationLogger, DefaultLogger } from "../logging/DefaultLogger";

describe("Logger configuration", () => {
    test("should use the default logger when no custom logger is defined", () => {
        const appConfig = new ApplicationConfiguration();

        expect(appConfig.Logger).toBe(DefaultApplicationLogger);
    });

    test("should allow replacing the logger and restoring the default fallback", () => {
        const appConfig = new ApplicationConfiguration();
        const customLogger = {
            Debug: jest.fn(),
            Info: jest.fn(),
            Warn: jest.fn(),
            Error: jest.fn()
        };

        appConfig.SetLogger(customLogger);
        expect(appConfig.Logger).toBe(customLogger);

        appConfig.SetLogger(undefined);
        expect(appConfig.Logger).toBe(DefaultApplicationLogger);
    });

    test("should route every default log level to console.log", () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
        const logger = new DefaultLogger();

        logger.Debug("debug message");
        logger.Info("info message");
        logger.Warn("warn message");
        logger.Error("error message");

        expect(logSpy).toHaveBeenCalledTimes(4);
        expect(logSpy).toHaveBeenNthCalledWith(1, "debug message");
        expect(logSpy).toHaveBeenNthCalledWith(2, "info message");
        expect(logSpy).toHaveBeenNthCalledWith(3, "warn message");
        expect(logSpy).toHaveBeenNthCalledWith(4, "error message");

        logSpy.mockRestore();
    });
});
