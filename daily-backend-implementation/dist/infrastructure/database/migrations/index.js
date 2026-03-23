"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.latestMigrationVersion = exports.migrations = void 0;
const tslib_1 = require("tslib");
const migration001 = tslib_1.__importStar(require("./001-create-users"));
const migration002 = tslib_1.__importStar(require("./002-create-cognitive-models"));
const migration003 = tslib_1.__importStar(require("./003-create-thought-fragments"));
const migration004 = tslib_1.__importStar(require("./004-create-cognitive-insights"));
const migration005 = tslib_1.__importStar(require("./005-create-suggestions"));
exports.migrations = [
    { version: 1, up: migration001.up, down: migration001.down },
    { version: 2, up: migration002.up, down: migration002.down },
    { version: 3, up: migration003.up, down: migration003.down },
    { version: 4, up: migration004.up, down: migration004.down },
    { version: 5, up: migration005.up, down: migration005.down },
];
exports.latestMigrationVersion = exports.migrations.length;
//# sourceMappingURL=index.js.map