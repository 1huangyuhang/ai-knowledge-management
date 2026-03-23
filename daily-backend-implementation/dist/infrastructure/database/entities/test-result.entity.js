"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestMetricEntity = exports.TestResultEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const performance_test_entity_1 = require("./performance-test.entity");
let TestResultEntity = class TestResultEntity {
    id;
    test_id;
    summary_json;
    created_at;
    performance_test;
    metrics;
};
exports.TestResultEntity = TestResultEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], TestResultEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], TestResultEntity.prototype, "test_id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('json'),
    tslib_1.__metadata("design:type", Object)
], TestResultEntity.prototype, "summary_json", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], TestResultEntity.prototype, "created_at", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => performance_test_entity_1.PerformanceTestEntity, (test) => test.results),
    tslib_1.__metadata("design:type", performance_test_entity_1.PerformanceTestEntity)
], TestResultEntity.prototype, "performance_test", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => TestMetricEntity, (metric) => metric.test_result),
    tslib_1.__metadata("design:type", Array)
], TestResultEntity.prototype, "metrics", void 0);
exports.TestResultEntity = TestResultEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('test_results')
], TestResultEntity);
let TestMetricEntity = class TestMetricEntity {
    id;
    result_id;
    name;
    value;
    unit;
    timestamp;
    endpoint;
    test_result;
};
exports.TestMetricEntity = TestMetricEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], TestMetricEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], TestMetricEntity.prototype, "result_id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], TestMetricEntity.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], TestMetricEntity.prototype, "value", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], TestMetricEntity.prototype, "unit", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Date)
], TestMetricEntity.prototype, "timestamp", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], TestMetricEntity.prototype, "endpoint", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => TestResultEntity, (result) => result.metrics),
    tslib_1.__metadata("design:type", TestResultEntity)
], TestMetricEntity.prototype, "test_result", void 0);
exports.TestMetricEntity = TestMetricEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('test_metrics')
], TestMetricEntity);
//# sourceMappingURL=test-result.entity.js.map