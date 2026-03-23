"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const email_1 = require("../../../domain/value-objects/email");
const password_1 = require("../../../domain/value-objects/password");
const auth_error_1 = require("../../../domain/errors/auth-error");
class LoginUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(input) {
        if (!input.email || !input.password) {
            throw new auth_error_1.AuthError('Email and password are required', 'INVALID_INPUT');
        }
        const email = new email_1.Email(input.email);
        const password = new password_1.Password(input.password, false);
        const user = await this.userRepository.getByEmail(email);
        if (!user) {
            throw auth_error_1.AuthError.userNotFound(input.email);
        }
        const isValidPassword = await user.validatePassword(input.password);
        if (!isValidPassword) {
            throw auth_error_1.AuthError.invalidPassword();
        }
        if (!user.getIsActive()) {
            throw auth_error_1.AuthError.userNotActive();
        }
        const token = 'mock-jwt-token-' + Date.now();
        return {
            user: {
                id: user.getId().getValue(),
                email: user.getEmail().getValue(),
                role: user.getRole(),
                firstName: user.getFirstName(),
                lastName: user.getLastName(),
                fullName: user.getFullName()
            },
            token
        };
    }
}
exports.LoginUseCase = LoginUseCase;
//# sourceMappingURL=login.use-case.js.map