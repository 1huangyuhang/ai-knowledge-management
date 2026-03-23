"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = void 0;
const tslib_1 = require("tslib");
const bcrypt = tslib_1.__importStar(require("bcryptjs"));
class Password {
    value;
    isHashed;
    constructor(value, isHashed = false) {
        if (!value || value.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        this.isHashed = isHashed;
        this.value = isHashed ? value : this.hashPassword(value);
    }
    getValue() {
        return this.value;
    }
    async validate(plainPassword) {
        if (this.isHashed) {
            return bcrypt.compare(plainPassword, this.value);
        }
        return plainPassword === this.value;
    }
    hashPassword(password) {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }
    equals(other) {
        return this.value === other.getValue();
    }
    static isStrongPassword(password) {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(password);
    }
}
exports.Password = Password;
//# sourceMappingURL=password.js.map