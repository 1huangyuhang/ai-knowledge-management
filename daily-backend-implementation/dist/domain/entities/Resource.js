"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = exports.ResourceStatus = exports.ResourceType = void 0;
class UUID {
    _value;
    constructor(value) {
        this._value = value;
    }
    get value() {
        return this._value;
    }
    static create() {
        return new UUID(crypto.randomUUID());
    }
    static fromString(value) {
        return new UUID(value);
    }
}
class Entity {
    _id;
    constructor(_id) {
        this._id = _id;
    }
    get id() {
        return this._id;
    }
}
var ResourceType;
(function (ResourceType) {
    ResourceType["LLM"] = "LLM";
    ResourceType["EMBEDDING"] = "EMBEDDING";
    ResourceType["VECTOR_DB"] = "VECTOR_DB";
    ResourceType["FILE_PROCESSING"] = "FILE_PROCESSING";
    ResourceType["SPEECH_PROCESSING"] = "SPEECH_PROCESSING";
    ResourceType["COGNITIVE_MODELING"] = "COGNITIVE_MODELING";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
var ResourceStatus;
(function (ResourceStatus) {
    ResourceStatus["AVAILABLE"] = "AVAILABLE";
    ResourceStatus["IN_USE"] = "IN_USE";
    ResourceStatus["MAINTENANCE"] = "MAINTENANCE";
    ResourceStatus["UNAVAILABLE"] = "UNAVAILABLE";
})(ResourceStatus || (exports.ResourceStatus = ResourceStatus = {}));
class Resource extends Entity {
    _name;
    _type;
    _description;
    _status;
    _capacity;
    _usedCapacity;
    _config;
    _metadata;
    _createdAt;
    _updatedAt;
    constructor(id, name, type, description, status, capacity, usedCapacity, config, metadata, createdAt, updatedAt) {
        super(id);
        this._name = name;
        this._type = type;
        this._description = description;
        this._status = status;
        this._capacity = capacity;
        this._usedCapacity = usedCapacity;
        this._config = config;
        this._metadata = metadata;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }
    static create(name, type, description, status, capacity, config = {}, metadata = {}) {
        const id = UUID.create();
        const now = new Date();
        return new Resource(id, name, type, description, status, capacity, 0, config, metadata, now, now);
    }
    update(name, description, status, capacity, config, metadata) {
        if (name !== undefined) {
            this._name = name;
        }
        if (description !== undefined) {
            this._description = description;
        }
        if (status !== undefined) {
            this._status = status;
        }
        if (capacity !== undefined) {
            this._capacity = capacity;
        }
        if (config !== undefined) {
            this._config = config;
        }
        if (metadata !== undefined) {
            this._metadata = metadata;
        }
        this._updatedAt = new Date();
    }
    allocate(amount) {
        if (this._status !== ResourceStatus.AVAILABLE) {
            return false;
        }
        if (this._usedCapacity + amount > this._capacity) {
            return false;
        }
        this._usedCapacity += amount;
        if (this._usedCapacity === this._capacity) {
            this._status = ResourceStatus.IN_USE;
        }
        this._updatedAt = new Date();
        return true;
    }
    release(amount) {
        this._usedCapacity = Math.max(0, this._usedCapacity - amount);
        if (this._usedCapacity < this._capacity && this._status === ResourceStatus.IN_USE) {
            this._status = ResourceStatus.AVAILABLE;
        }
        this._updatedAt = new Date();
    }
    reset() {
        this._usedCapacity = 0;
        this._status = ResourceStatus.AVAILABLE;
        this._updatedAt = new Date();
    }
    get usageRate() {
        return this._capacity > 0 ? this._usedCapacity / this._capacity : 0;
    }
    get remainingCapacity() {
        return this._capacity - this._usedCapacity;
    }
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
    }
    get description() {
        return this._description;
    }
    get status() {
        return this._status;
    }
    get capacity() {
        return this._capacity;
    }
    get usedCapacity() {
        return this._usedCapacity;
    }
    get config() {
        return { ...this._config };
    }
    get metadata() {
        return { ...this._metadata };
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
}
exports.Resource = Resource;
//# sourceMappingURL=Resource.js.map