"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector = void 0;
class Vector {
    id;
    content;
    embedding;
    metadata;
    constructor(params) {
        this.id = params.id;
        this.content = params.content;
        this.embedding = params.embedding;
        this.metadata = params.metadata || {};
    }
}
exports.Vector = Vector;
//# sourceMappingURL=Vector.js.map