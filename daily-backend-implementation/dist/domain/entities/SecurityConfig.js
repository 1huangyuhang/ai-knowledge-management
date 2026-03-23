"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMethod = exports.EncryptionAlgorithm = exports.SecurityLevel = void 0;
var SecurityLevel;
(function (SecurityLevel) {
    SecurityLevel["LOW"] = "LOW";
    SecurityLevel["MEDIUM"] = "MEDIUM";
    SecurityLevel["HIGH"] = "HIGH";
    SecurityLevel["CRITICAL"] = "CRITICAL";
})(SecurityLevel || (exports.SecurityLevel = SecurityLevel = {}));
var EncryptionAlgorithm;
(function (EncryptionAlgorithm) {
    EncryptionAlgorithm["AES_256"] = "AES-256";
    EncryptionAlgorithm["RSA_2048"] = "RSA-2048";
    EncryptionAlgorithm["RSA_4096"] = "RSA-4096";
    EncryptionAlgorithm["SHA_256"] = "SHA-256";
    EncryptionAlgorithm["SHA_512"] = "SHA-512";
})(EncryptionAlgorithm || (exports.EncryptionAlgorithm = EncryptionAlgorithm = {}));
var AuthMethod;
(function (AuthMethod) {
    AuthMethod["TOKEN"] = "TOKEN";
    AuthMethod["PASSWORD"] = "PASSWORD";
    AuthMethod["MFA"] = "MFA";
    AuthMethod["API_KEY"] = "API_KEY";
})(AuthMethod || (exports.AuthMethod = AuthMethod = {}));
//# sourceMappingURL=SecurityConfig.js.map