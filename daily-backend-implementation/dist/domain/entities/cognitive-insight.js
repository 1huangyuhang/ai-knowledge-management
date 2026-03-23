"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveInsight = void 0;
const uuid_1 = require("../value-objects/uuid");
class CognitiveInsight {
    id;
    userId;
    title;
    description;
    type;
    priority;
    isRead;
    createdAt;
    updatedAt;
    constructor(params) {
        if (!params.title || params.title.trim().length === 0) {
            throw new Error('Insight title cannot be empty');
        }
        this.id = params.id || uuid_1.UUID.generate();
        this.userId = params.userId;
        this.title = params.title;
        this.description = params.description;
        this.type = params.type;
        this.priority = this.validatePriority(params.priority || 1);
        this.isRead = params.isRead !== undefined ? params.isRead : false;
        this.createdAt = params.createdAt || new Date();
        this.updatedAt = params.updatedAt || new Date();
    }
    getId() {
        return this.id;
    }
    getUserId() {
        return this.userId;
    }
    getTitle() {
        return this.title;
    }
    setTitle(title) {
        if (!title || title.trim().length === 0) {
            throw new Error('Insight title cannot be empty');
        }
        this.title = title;
        this.updatedAt = new Date();
    }
    getDescription() {
        return this.description;
    }
    setDescription(description) {
        this.description = description;
        this.updatedAt = new Date();
    }
    getType() {
        return this.type;
    }
    setType(type) {
        this.type = type;
        this.updatedAt = new Date();
    }
    getPriority() {
        return this.priority;
    }
    setPriority(priority) {
        this.priority = this.validatePriority(priority);
        this.updatedAt = new Date();
    }
    validatePriority(priority) {
        if (priority < 1 || priority > 5) {
            throw new Error('Priority must be between 1 and 5');
        }
        return priority;
    }
    getIsRead() {
        return this.isRead;
    }
    markAsRead() {
        this.isRead = true;
        this.updatedAt = new Date();
    }
    markAsUnread() {
        this.isRead = false;
        this.updatedAt = new Date();
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    equals(other) {
        return this.id.equals(other.getId());
    }
}
exports.CognitiveInsight = CognitiveInsight;
//# sourceMappingURL=cognitive-insight.js.map