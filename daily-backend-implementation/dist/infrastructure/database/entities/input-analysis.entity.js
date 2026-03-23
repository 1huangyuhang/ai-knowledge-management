"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputAnalysisEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const InputAnalysis_1 = require("../../../domain/entities/InputAnalysis");
let InputAnalysisEntity = class InputAnalysisEntity {
    id;
    inputId;
    type;
    result;
    status;
    confidence;
    createdAt;
    updatedAt;
};
exports.InputAnalysisEntity = InputAnalysisEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], InputAnalysisEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('uuid'),
    tslib_1.__metadata("design:type", String)
], InputAnalysisEntity.prototype, "inputId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    tslib_1.__metadata("design:type", String)
], InputAnalysisEntity.prototype, "type", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('json'),
    tslib_1.__metadata("design:type", Object)
], InputAnalysisEntity.prototype, "result", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('varchar', { length: 20 }),
    tslib_1.__metadata("design:type", String)
], InputAnalysisEntity.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 4, scale: 3 }),
    tslib_1.__metadata("design:type", Number)
], InputAnalysisEntity.prototype, "confidence", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], InputAnalysisEntity.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], InputAnalysisEntity.prototype, "updatedAt", void 0);
exports.InputAnalysisEntity = InputAnalysisEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('input_analyses'),
    (0, typeorm_1.Index)(['inputId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['type']),
    (0, typeorm_1.Index)(['createdAt'])
], InputAnalysisEntity);
//# sourceMappingURL=input-analysis.entity.js.map