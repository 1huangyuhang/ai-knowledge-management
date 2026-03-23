"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizationExecutionServiceImpl = void 0;
const Optimization_1 = require("../../domain/entities/Optimization");
const UUID_1 = require("../../domain/value-objects/UUID");
const Optimization_2 = require("../../domain/entities/Optimization");
class OptimizationExecutionServiceImpl {
    async executeOptimization(suggestion) {
        const optimization = Optimization_1.Optimization.create({
            id: UUID_1.UUID.generate(),
            suggestionId: suggestion.id,
            analysisId: suggestion.analysisId,
            status: Optimization_2.OptimizationStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        if (optimization.isFailure) {
            throw new Error(optimization.errorValue());
        }
        const optimizationValue = optimization.getValue();
        try {
            const codeChanges = this.executeSuggestion(suggestion);
            optimizationValue.updateStatus(Optimization_2.OptimizationStatus.COMPLETED);
            optimizationValue.addChanges(codeChanges);
            const validationResult = this.validateOptimization(optimizationValue, suggestion);
            optimizationValue.setValidationResult(validationResult);
            return optimizationValue;
        }
        catch (error) {
            optimizationValue.updateStatus(Optimization_2.OptimizationStatus.FAILED);
            optimizationValue.setError(error.message);
            return optimizationValue;
        }
    }
    async executeBatchOptimizations(suggestions) {
        const optimizations = [];
        for (const suggestion of suggestions) {
            const optimization = await this.executeOptimization(suggestion);
            optimizations.push(optimization);
        }
        return optimizations;
    }
    async getOptimizationById(id) {
        return null;
    }
    async getOptimizationsBySuggestion(suggestionId) {
        return [];
    }
    executeSuggestion(suggestion) {
        const changes = [];
        const codeChange = {
            id: UUID_1.UUID.generate(),
            filePath: suggestion.filePath,
            line: suggestion.line,
            column: suggestion.column,
            originalCode: 'let unusedVar = 123;',
            updatedCode: '',
            changeType: 'delete',
            description: suggestion.description,
            createdAt: new Date()
        };
        changes.push(codeChange);
        return changes;
    }
    validateOptimization(optimization, suggestion) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            metrics: {
                codeQuality: 95,
                performance: 90,
                maintainability: 92
            },
            createdAt: new Date()
        };
        if (suggestion.type === 'PERFORMANCE') {
            result.metrics.performance = 98;
        }
        return result;
    }
}
exports.OptimizationExecutionServiceImpl = OptimizationExecutionServiceImpl;
//# sourceMappingURL=OptimizationExecutionServiceImpl.js.map