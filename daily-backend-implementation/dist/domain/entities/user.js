"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserImpl = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
class UserImpl {
    id;
    username;
    email;
    passwordHash;
    role;
    createdAt;
    updatedAt;
    isActive;
    constructor(id, username, email, passwordHash, role = UserRole.USER, createdAt = new Date()) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = new Date();
        this.isActive = true;
    }
    async validatePassword(password) {
        throw new Error('validatePassword method not implemented yet');
    }
    update(updates) {
        if (updates.username) {
            this.username = updates.username;
        }
        if (updates.email) {
            this.email = updates.email;
        }
        if (updates.role) {
            this.role = updates.role;
        }
        if (updates.isActive !== undefined) {
            this.isActive = updates.isActive;
        }
        this.updatedAt = new Date();
    }
    activate() {
        this.isActive = true;
        this.updatedAt = new Date();
    }
    deactivate() {
        this.isActive = false;
        this.updatedAt = new Date();
    }
}
exports.UserImpl = UserImpl;
//# sourceMappingURL=user.js.map