"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceReportEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
let PerformanceReportEntity = class PerformanceReportEntity {
    id;
    test_id;
    test_name;
    test_type;
    executed_at;
    summary_json;
    analysis_json;
    recommendations;
    created_at;
};
exports.PerformanceReportEntity = PerformanceReportEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], PerformanceReportEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], PerformanceReportEntity.prototype, "test_id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], PerformanceReportEntity.prototype, "test_name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], PerformanceReportEntity.prototype, "test_type", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Date)
], PerformanceReportEntity.prototype, "executed_at", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('json'),
    tslib_1.__metadata("design:type", Object)
], PerformanceReportEntity.prototype, "summary_json", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('json'),
    tslib_1.__metadata("design:type", Object)
], PerformanceReportEntity.prototype, "analysis_json", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('json'),
    tslib_1.__metadata("design:type", Array)
], PerformanceReportEntity.prototype, "recommendations", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], PerformanceReportEntity.prototype, "created_at", void 0);
exports.PerformanceReportEntity = PerformanceReportEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('performance_reports')
], PerformanceReportEntity);
//# sourceMappingURL=performance-report.entity.js.map