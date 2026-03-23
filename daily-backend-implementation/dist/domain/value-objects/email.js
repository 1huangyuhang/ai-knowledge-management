"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
class Email {
    value;
    constructor(value) {
        if (!this.isValidEmail(value)) {
            throw new Error('Invalid email format');
        }
        this.value = value.toLowerCase();
    }
    getValue() {
        return this.value;
    }
    isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
    equals(other) {
        return this.value === other.getValue();
    }
    getUsername() {
        const parts = this.value.split('@');
        return parts[0] || '';
    }
    getDomain() {
        const parts = this.value.split('@');
        return parts[1] || '';
    }
}
exports.Email = Email;
//# sourceMappingURL=email.js.map