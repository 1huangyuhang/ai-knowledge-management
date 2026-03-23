"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestScenarioEntity = exports.PerformanceTestEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const test_result_entity_1 = require("./test-result.entity");
let PerformanceTestEntity = class PerformanceTestEntity {
    id;
    name;
    description;
    test_type;
    scenario_id;
    status;
    created_at;
    executed_at;
    completed_at;
    results;
};
exports.PerformanceTestEntity = PerformanceTestEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], PerformanceTestEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], PerformanceTestEntity.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('text'),
    tslib_1.__metadata("design:type", String)
], PerformanceTestEntity.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], PerformanceTestEntity.prototype, "test_type", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], PerformanceTestEntity.prototype, "scenario_id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], PerformanceTestEntity.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], PerformanceTestEntity.prototype, "created_at", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", Date)
], PerformanceTestEntity.prototype, "executed_at", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", Date)
], PerformanceTestEntity.prototype, "completed_at", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => test_result_entity_1.TestResultEntity, (result) => result.performance_test),
    tslib_1.__metadata("design:type", Array)
], PerformanceTestEntity.prototype, "results", void 0);
exports.PerformanceTestEntity = PerformanceTestEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('performance_tests')
], PerformanceTestEntity);
let TestScenarioEntity = class TestScenarioEntity {
    id;
    name;
    description;
    endpoints_json;
    config_json;
    created_at;
    updated_at;
};
exports.TestScenarioEntity = TestScenarioEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], TestScenarioEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], TestScenarioEntity.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('text'),
    tslib_1.__metadata("design:type", String)
], TestScenarioEntity.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('json'),
    tslib_1.__metadata("design:type", Array)
], TestScenarioEntity.prototype, "endpoints_json", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('json'),
    tslib_1.__metadata("design:type", Object)
], TestScenarioEntity.prototype, "config_json", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], TestScenarioEntity.prototype, "created_at", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], TestScenarioEntity.prototype, "updated_at", void 0);
exports.TestScenarioEntity = TestScenarioEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('test_scenarios')
], TestScenarioEntity);
//# sourceMappingURL=performance-test.entity.js.map