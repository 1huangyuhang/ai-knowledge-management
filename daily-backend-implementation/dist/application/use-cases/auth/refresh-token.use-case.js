"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenUseCase = void 0;
const uuid_1 = require("../../../domain/value-objects/uuid");
const auth_error_1 = require("../../../domain/errors/auth-error");
class RefreshTokenUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(input) {
        if (!input.userId || !input.refreshToken) {
            throw new auth_error_1.AuthError('User ID and refresh token are required', 'INVALID_INPUT');
        }
        const userId = uuid_1.UUID.fromString(input.userId);
        const user = await this.userRepository.getById(userId);
        if (!user) {
            throw auth_error_1.AuthError.userNotFoundById(input.userId);
        }
        if (!user.getIsActive()) {
            throw auth_error_1.AuthError.userNotActive();
        }
        const isValidRefreshToken = true;
        if (!isValidRefreshToken) {
            throw auth_error_1.AuthError.invalidRefreshToken();
        }
        const token = 'new-jwt-token-' + Date.now();
        const newRefreshToken = 'new-refresh-token-' + Date.now();
        return {
            token,
            refreshToken: newRefreshToken
        };
    }
}
exports.RefreshTokenUseCase = RefreshTokenUseCase;
//# sourceMappingURL=refresh-token.use-case.js.map