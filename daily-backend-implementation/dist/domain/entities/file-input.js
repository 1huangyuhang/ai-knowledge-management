"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileInput = void 0;
const uuid_1 = require("../value-objects/uuid");
class FileInput {
    _id;
    _name;
    _type;
    _size;
    _content;
    _metadata;
    _createdAt;
    _updatedAt;
    _userId;
    constructor(props) {
        this._id = props.id || uuid_1.UUID.create();
        this._name = props.name;
        this._type = props.type;
        this._size = props.size;
        this._content = props.content;
        this._metadata = props.metadata;
        this._createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
        this._userId = props.userId;
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
    }
    get size() {
        return this._size;
    }
    get content() {
        return this._content;
    }
    get metadata() {
        return this._metadata;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    get userId() {
        return this._userId;
    }
    updateContent(content) {
        this._content = content;
        this._updatedAt = new Date();
    }
    updateMetadata(metadata) {
        this._metadata = { ...this._metadata, ...metadata };
        this._updatedAt = new Date();
    }
}
exports.FileInput = FileInput;
//# sourceMappingURL=file-input.js.map