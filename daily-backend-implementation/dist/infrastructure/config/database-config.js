"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = getDatabaseConfig;
function getDatabaseConfig() {
    return {
        type: 'sqlite',
        database: './data/database.sqlite',
        logging: true,
        synchronize: true
    };
}
//# sourceMappingURL=database-config.js.map