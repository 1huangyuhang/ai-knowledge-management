"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pino_logger_service_1 = require("../pino-logger.service");
describe('Logger Integration Tests', () => {
    let logger;
    beforeEach(() => {
        logger = new pino_logger_service_1.PinoLoggerService({ level: 'debug', prettyPrint: false });
    });
    test('should log info messages without throwing errors', async () => {
        const message = 'Test info message';
        expect(() => logger.info(message, { context: 'test' })).not.toThrow();
    });
    test('should log error messages without throwing errors', async () => {
        const error = new Error('Test error');
        expect(() => logger.error('Test error message', { error, context: 'test' })).not.toThrow();
    });
    test('should log debug messages without throwing errors', async () => {
        const message = 'Test debug message';
        expect(() => logger.debug(message, { context: 'test' })).not.toThrow();
    });
    test('should log warning messages without throwing errors', async () => {
        const message = 'Test warning message';
        expect(() => logger.warn(message, { context: 'test' })).not.toThrow();
    });
    test('should log fatal messages without throwing errors', async () => {
        const message = 'Test fatal message';
        const error = new Error('Test fatal error');
        expect(() => logger.fatal(message, error, { context: 'test' })).not.toThrow();
    });
});
//# sourceMappingURL=logging-integration.test.js.map