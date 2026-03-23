"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUseCase = void 0;
const email_1 = require("../../../domain/value-objects/email");
const password_1 = require("../../../domain/value-objects/password");
const auth_error_1 = require("../../../domain/errors/auth-error");
class RegisterUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(input) {
        if (!input.email || !input.password || !input.firstName || !input.lastName) {
            throw new auth_error_1.AuthError('All fields are required', 'INVALID_INPUT');
        }
        const email = new email_1.Email(input.email);
        const password = new password_1.Password(input.password, true);
        const existingUser = await this.userRepository.getByEmail(email);
        if (existingUser) {
            throw auth_error_1.AuthError.emailAlreadyExists(input.email);
        }
        const user = new user_1.User({
            email,
            password,
            firstName: input.firstName,
            lastName: input.lastName
        });
        const createdUser = await this.userRepository.create(user);
        const token = 'mock-jwt-token-' + Date.now();
        return {
            user: {
                id: createdUser.getId().getValue(),
                email: createdUser.getEmail().getValue(),
                role: createdUser.getRole(),
                firstName: createdUser.getFirstName(),
                lastName: createdUser.getLastName(),
                fullName: createdUser.getFullName()
            },
            token
        };
    }
}
exports.RegisterUseCase = RegisterUseCase;
//# sourceMappingURL=register.use-case.js.map