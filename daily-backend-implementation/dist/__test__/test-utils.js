"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestUtils = void 0;
const database_connection_1 = require("../infrastructure/database/database-connection");
const event_bus_1 = require("../infrastructure/events/event-bus");
const pino_logger_service_1 = require("../infrastructure/logging/pino-logger.service");
const resource_manager_1 = require("./resource-manager");
const error_handler_1 = require("../infrastructure/error/error-handler");
class TestUtils {
    static async createTestEnvironment() {
        const databaseConnection = database_connection_1.DatabaseConnection.getInstance();
        await databaseConnection.initialize();
        const eventBus = new event_bus_1.InMemoryEventBus();
        const logger = new pino_logger_service_1.PinoLoggerService();
        const errorHandler = new error_handler_1.DefaultErrorHandler(logger, false);
        const resourceManager = new resource_manager_1.ResourceManager();
        return {
            databaseConnection,
            eventBus,
            logger,
            errorHandler,
            resourceManager,
        };
    }
    static async cleanupTestEnvironment(environment) {
        await environment.resourceManager.cleanup();
        await environment.databaseConnection.close();
    }
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static async catchError(fn) {
        try {
            await fn();
            return null;
        }
        catch (error) {
            return error;
        }
    }
}
exports.TestUtils = TestUtils;
//# sourceMappingURL=test-utils.js.map