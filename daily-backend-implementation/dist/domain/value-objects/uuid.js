"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUID = void 0;
class UUID {
    _value;
    constructor(value) {
        if (!UUID.isValid(value)) {
            throw new Error(`Invalid UUID format: ${value}`);
        }
        this._value = value;
    }
    get value() {
        return this._value;
    }
    static generate() {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        return new UUID(uuid);
    }
    static fromString(value) {
        return new UUID(value);
    }
    static isValid(value) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    }
    equals(other) {
        return this._value === other._value;
    }
    toString() {
        return this._value;
    }
}
exports.UUID = UUID;
//# sourceMappingURL=uuid.js.map