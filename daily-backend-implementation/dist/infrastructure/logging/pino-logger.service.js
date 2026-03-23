"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinoLoggerService = void 0;
const tslib_1 = require("tslib");
const pino_1 = tslib_1.__importDefault(require("pino"));
class PinoLoggerService {
    logger;
    constructor(config = { level: 'info', prettyPrint: true }) {
        const isTest = process.env.NODE_ENV === 'test';
        const shouldPrettyPrint = config.prettyPrint && !isTest;
        const pinoOptions = {
            level: config.level,
            ...(shouldPrettyPrint
                ? {
                    transport: {
                        target: 'pino-pretty',
                        options: {
                            colorize: true,
                            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
                            ignore: 'pid,hostname',
                        },
                    },
                }
                : {}),
        };
        this.logger = (0, pino_1.default)(pinoOptions);
    }
    debug(message, metadata) {
        if (metadata) {
            this.logger.debug(metadata, message);
        }
        else {
            this.logger.debug(message);
        }
    }
    info(message, metadata) {
        if (metadata) {
            this.logger.info(metadata, message);
        }
        else {
            this.logger.info(message);
        }
    }
    warn(message, metadata) {
        if (metadata) {
            this.logger.warn(metadata, message);
        }
        else {
            this.logger.warn(message);
        }
    }
    error(message, error, metadata) {
        if (error) {
            this.logger.error({
                ...metadata,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            }, message);
        }
        else if (metadata) {
            this.logger.error(metadata, message);
        }
        else {
            this.logger.error(message);
        }
    }
    fatal(message, error, metadata) {
        if (error) {
            this.logger.fatal({
                ...metadata,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            }, message);
        }
        else if (metadata) {
            this.logger.fatal(metadata, message);
        }
        else {
            this.logger.fatal(message);
        }
    }
}
exports.PinoLoggerService = PinoLoggerService;
//# sourceMappingURL=pino-logger.service.js.map