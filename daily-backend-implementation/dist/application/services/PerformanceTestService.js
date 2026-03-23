"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTestService = void 0;
const PerformanceTest_1 = require("../../domain/entities/PerformanceTest");
const UniqueEntityID_1 = require("../../domain/value-objects/UniqueEntityID");
const PerformanceTestStatus_1 = require("../../domain/enums/PerformanceTestStatus");
const Result_1 = require("../../domain/core/Result");
class PerformanceTestService {
    performanceTestRepository;
    loggerService;
    constructor(props) {
        this.performanceTestRepository = props.performanceTestRepository;
        this.loggerService = props.loggerService;
    }
    async createPerformanceTest(testData) {
        try {
            this.loggerService.info(`Creating performance test: ${testData.name}`, {
                testType: testData.testType,
            });
            const performanceTestResult = PerformanceTest_1.PerformanceTest.create({
                name: testData.name,
                description: testData.description,
                testType: testData.testType,
                status: PerformanceTestStatus_1.PerformanceTestStatus.CREATED,
                testData: testData.testData,
                createdAt: new Date(),
                updatedAt: new Date(),
                scheduledAt: testData.scheduledAt,
            });
            if (performanceTestResult.isFailure) {
                return Result_1.Result.fail(performanceTestResult.error);
            }
            const createdTest = await this.performanceTestRepository.create(performanceTestResult.getValue());
            this.loggerService.info(`Performance test created successfully: ${createdTest.id.toString()}`, {
                testName: createdTest.name,
            });
            return Result_1.Result.ok(createdTest);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.loggerService.error(`Failed to create performance test: ${errorMessage}`, {
                testData,
                error,
            });
            return Result_1.Result.fail(`Failed to create performance test: ${errorMessage}`);
        }
    }
    async runPerformanceTest(testId) {
        try {
            this.loggerService.info(`Running performance test: ${testId}`);
            const test = await this.performanceTestRepository.getById(new UniqueEntityID_1.UniqueEntityID(testId));
            if (!test) {
                return Result_1.Result.fail(`Performance test not found: ${testId}`);
            }
            test.updateStatus(PerformanceTestStatus_1.PerformanceTestStatus.RUNNING);
            test.setExecutedAt(new Date());
            await this.performanceTestRepository.update(test);
            const testResults = await this.executeTest(test);
            testResults.forEach(result => {
                test.addResult(result);
            });
            test.updateStatus(PerformanceTestStatus_1.PerformanceTestStatus.COMPLETED);
            test.setCompletedAt(new Date());
            const updatedTest = await this.performanceTestRepository.update(test);
            this.loggerService.info(`Performance test completed successfully: ${testId}`, {
                resultsCount: testResults.length,
            });
            return Result_1.Result.ok(updatedTest);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.loggerService.error(`Failed to run performance test: ${errorMessage}`, {
                testId,
                error,
            });
            try {
                const test = await this.performanceTestRepository.getById(new UniqueEntityID_1.UniqueEntityID(testId));
                if (test) {
                    test.updateStatus(PerformanceTestStatus_1.PerformanceTestStatus.FAILED);
                    test.setCompletedAt(new Date());
                    await this.performanceTestRepository.update(test);
                }
            }
            catch (updateError) {
                this.loggerService.error(`Failed to update test status after failure: ${updateError}`, {
                    testId,
                    error: updateError,
                });
            }
            return Result_1.Result.fail(`Failed to run performance test: ${errorMessage}`);
        }
    }
    async executeTest(test) {
        this.loggerService.info(`Executing test: ${test.name} (${test.testType})`);
        return [
            {
                metricName: 'response_time',
                value: Math.random() * 1000,
                unit: 'ms',
                timestamp: new Date(),
                thresholds: {
                    warning: 500,
                    critical: 1000,
                },
                status: 'ok',
            },
            {
                metricName: 'throughput',
                value: Math.random() * 1000,
                unit: 'requests/second',
                timestamp: new Date(),
                thresholds: {
                    warning: 500,
                    critical: 200,
                },
                status: 'ok',
            },
            {
                metricName: 'error_rate',
                value: Math.random() * 10,
                unit: '%',
                timestamp: new Date(),
                thresholds: {
                    warning: 5,
                    critical: 10,
                },
                status: 'ok',
            },
        ];
    }
    async getPerformanceTests(filters) {
        try {
            this.loggerService.info('Getting performance tests', { filters });
            const tests = await this.performanceTestRepository.getAll(filters);
            return Result_1.Result.ok(tests);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.loggerService.error(`Failed to get performance tests: ${errorMessage}`, {
                filters,
                error,
            });
            return Result_1.Result.fail(`Failed to get performance tests: ${errorMessage}`);
        }
    }
    async getPerformanceTestById(testId) {
        try {
            this.loggerService.info(`Getting performance test by ID: ${testId}`);
            const test = await this.performanceTestRepository.getById(new UniqueEntityID_1.UniqueEntityID(testId));
            if (!test) {
                return Result_1.Result.fail(`Performance test not found: ${testId}`);
            }
            return Result_1.Result.ok(test);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.loggerService.error(`Failed to get performance test by ID: ${errorMessage}`, {
                testId,
                error,
            });
            return Result_1.Result.fail(`Failed to get performance test by ID: ${errorMessage}`);
        }
    }
    async deletePerformanceTest(testId) {
        try {
            this.loggerService.info(`Deleting performance test: ${testId}`);
            const result = await this.performanceTestRepository.delete(new UniqueEntityID_1.UniqueEntityID(testId));
            return Result_1.Result.ok(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.loggerService.error(`Failed to delete performance test: ${errorMessage}`, {
                testId,
                error,
            });
            return Result_1.Result.fail(`Failed to delete performance test: ${errorMessage}`);
        }
    }
}
exports.PerformanceTestService = PerformanceTestService;
//# sourceMappingURL=PerformanceTestService.js.map