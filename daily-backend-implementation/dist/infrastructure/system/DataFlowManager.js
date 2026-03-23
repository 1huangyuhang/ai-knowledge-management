"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataFlowManager = exports.DefaultDataFlowManager = void 0;
class DefaultDataFlowManager {
    transformers = new Map();
    validators = new Map();
    async registerDataTransformer(sourceModule, targetModule, transformer) {
        if (!this.transformers.has(sourceModule)) {
            this.transformers.set(sourceModule, new Map());
        }
        this.transformers.get(sourceModule).set(targetModule, transformer);
    }
    async transformData(sourceModule, targetModule, data) {
        const sourceTransformers = this.transformers.get(sourceModule);
        if (!sourceTransformers) {
            throw new Error(`No transformers registered for source module ${sourceModule}`);
        }
        const transformer = sourceTransformers.get(targetModule);
        if (!transformer) {
            throw new Error(`No transformer registered from ${sourceModule} to ${targetModule}`);
        }
        return transformer.transform(data);
    }
    async registerDataValidator(moduleId, validator) {
        this.validators.set(moduleId, validator);
    }
    async validateData(moduleId, data) {
        const validator = this.validators.get(moduleId);
        if (validator) {
            return validator.validate(data);
        }
        return {
            isValid: true,
            errors: [],
            timestamp: new Date().toISOString()
        };
    }
    async removeDataTransformer(sourceModule, targetModule) {
        const sourceTransformers = this.transformers.get(sourceModule);
        if (sourceTransformers) {
            sourceTransformers.delete(targetModule);
            if (sourceTransformers.size === 0) {
                this.transformers.delete(sourceModule);
            }
        }
    }
    async removeDataValidator(moduleId) {
        this.validators.delete(moduleId);
    }
}
exports.DefaultDataFlowManager = DefaultDataFlowManager;
exports.dataFlowManager = new DefaultDataFlowManager();
//# sourceMappingURL=DataFlowManager.js.map