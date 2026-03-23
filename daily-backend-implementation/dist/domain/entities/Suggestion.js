"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Suggestion = void 0;
class Entity {
    _id;
    constructor(_id) {
        this._id = _id;
    }
    get id() {
        return this._id;
    }
}
class Suggestion extends Entity {
    _type;
    _content;
    _description;
    _priority;
    _confidence;
    _relatedConcepts;
    _actionItems;
    _category;
    _metadata;
    _userId;
    _cognitiveModelId;
    _context;
    constructor(id, type, content, description, priority, confidence, relatedConcepts, actionItems, category, userId, cognitiveModelId, context, metadata = {}) {
        super(id);
        this._type = type;
        this._content = content;
        this._description = description;
        this._priority = priority;
        this._confidence = confidence;
        this._relatedConcepts = relatedConcepts;
        this._actionItems = actionItems;
        this._category = category;
        this._metadata = metadata;
        this._userId = userId;
        this._cognitiveModelId = cognitiveModelId;
        this._context = context;
    }
    get type() {
        return this._type;
    }
    get content() {
        return this._content;
    }
    get description() {
        return this._description;
    }
    get priority() {
        return this._priority;
    }
    get confidence() {
        return this._confidence;
    }
    get relatedConcepts() {
        return [...this._relatedConcepts];
    }
    get actionItems() {
        return [...this._actionItems];
    }
    get category() {
        return this._category;
    }
    get metadata() {
        return { ...this._metadata };
    }
    get userId() {
        return this._userId;
    }
    get cognitiveModelId() {
        return this._cognitiveModelId;
    }
    get context() {
        return this._context;
    }
    setPriority(priority) {
        if (priority < 0 || priority > 10) {
            throw new Error('优先级必须在0-10之间');
        }
        this._priority = priority;
    }
    setConfidence(confidence) {
        if (confidence < 0 || confidence > 1) {
            throw new Error('置信度必须在0-1之间');
        }
        this._confidence = confidence;
    }
    addRelatedConcept(concept) {
        if (!this._relatedConcepts.includes(concept)) {
            this._relatedConcepts.push(concept);
        }
    }
    addActionItem(actionItem) {
        if (!this._actionItems.includes(actionItem)) {
            this._actionItems.push(actionItem);
        }
    }
    updateMetadata(key, value) {
        this._metadata[key] = value;
    }
}
exports.Suggestion = Suggestion;
//# sourceMappingURL=Suggestion.js.map