"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveModel = void 0;
const uuid_1 = require("../value-objects/uuid");
class CognitiveModel {
    id;
    userId;
    name;
    description;
    isActive;
    createdAt;
    updatedAt;
    version;
    constructor(params) {
        if (!params.name || params.name.trim().length === 0) {
            throw new Error('Cognitive model name cannot be empty');
        }
        this.id = params.id || uuid_1.UUID.generate();
        this.userId = params.userId;
        this.name = params.name;
        this.description = params.description;
        this.isActive = params.isActive !== undefined ? params.isActive : true;
        this.createdAt = params.createdAt || new Date();
        this.updatedAt = params.updatedAt || new Date();
        this.version = params.version || 1;
    }
    getId() {
        return this.id;
    }
    getUserId() {
        return this.userId;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        if (!name || name.trim().length === 0) {
            throw new Error('Cognitive model name cannot be empty');
        }
        this.name = name;
        this.updatedAt = new Date();
        this.incrementVersion();
    }
    getDescription() {
        return this.description;
    }
    setDescription(description) {
        this.description = description;
        this.updatedAt = new Date();
        this.incrementVersion();
    }
    getIsActive() {
        return this.isActive;
    }
    activate() {
        this.isActive = true;
        this.updatedAt = new Date();
        this.incrementVersion();
    }
    deactivate() {
        this.isActive = false;
        this.updatedAt = new Date();
        this.incrementVersion();
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    getVersion() {
        return this.version;
    }
    incrementVersion() {
        this.version += 1;
    }
    equals(other) {
        return this.id.equals(other.getId());
    }
}
exports.CognitiveModel = CognitiveModel;
//# sourceMappingURL=cognitive-model.js.map