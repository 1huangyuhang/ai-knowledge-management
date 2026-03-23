"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputIntegrationController = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Controller_1 = require("../decorators/Controller");
const Post_1 = require("../decorators/Post");
const Get_1 = require("../decorators/Get");
const InputAdapter_1 = require("../../application/adapters/InputAdapter");
const InputMerger_1 = require("../../application/services/InputMerger");
const InputRouter_1 = require("../../application/services/InputRouter");
const InputPrioritizer_1 = require("../../application/services/InputPrioritizer");
const AITaskStatus_1 = require("../../domain/enums/AITaskStatus");
const AITask_1 = require("../../domain/entities/AITask");
let InputIntegrationController = class InputIntegrationController {
    inputAdapter;
    inputPrioritizer;
    inputMerger;
    inputRouter;
    aiTaskRepository;
    constructor(inputAdapter, inputPrioritizer, inputMerger, inputRouter, aiTaskRepository) {
        this.inputAdapter = inputAdapter;
        this.inputPrioritizer = inputPrioritizer;
        this.inputMerger = inputMerger;
        this.inputRouter = inputRouter;
        this.aiTaskRepository = aiTaskRepository;
    }
    async integrateInput(request, reply) {
        try {
            const inputData = request.body;
            const unifiedInput = this.inputAdapter.normalizeInput(inputData);
            const prioritizedInput = this.inputPrioritizer.assignPriority(unifiedInput);
            const routeDestination = this.inputRouter.routeInput(prioritizedInput);
            const aiTask = new AITask_1.AITask({
                type: routeDestination.service,
                input: prioritizedInput,
                status: AITaskStatus_1.AITaskStatus.PENDING,
                metadata: {
                    flow: routeDestination.flow,
                    queue: routeDestination.queue,
                    priority: routeDestination.priority
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const savedTask = await this.aiTaskRepository.save(aiTask);
            reply.code(201).send({
                success: true,
                data: savedTask,
                message: '输入整合成功，已创建AI任务'
            });
        }
        catch (error) {
            reply.code(500).send({
                success: false,
                message: '输入整合失败',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    async getInputHistory(request, reply) {
        try {
            reply.code(200).send({
                success: true,
                data: [],
                message: '输入历史查询成功'
            });
        }
        catch (error) {
            reply.code(500).send({
                success: false,
                message: '输入历史查询失败',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    async getInputStatistics(request, reply) {
        try {
            reply.code(200).send({
                success: true,
                data: {
                    totalInputs: 0,
                    inputTypes: {
                        file: 0,
                        speech: 0,
                        text: 0,
                        merged: 0
                    },
                    priorityDistribution: {
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 0,
                        5: 0
                    }
                },
                message: '输入统计信息查询成功'
            });
        }
        catch (error) {
            reply.code(500).send({
                success: false,
                message: '输入统计信息查询失败',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
};
exports.InputIntegrationController = InputIntegrationController;
tslib_1.__decorate([
    (0, Post_1.Post)('/integrate'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], InputIntegrationController.prototype, "integrateInput", null);
tslib_1.__decorate([
    (0, Get_1.Get)('/history'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], InputIntegrationController.prototype, "getInputHistory", null);
tslib_1.__decorate([
    (0, Get_1.Get)('/statistics'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], InputIntegrationController.prototype, "getInputStatistics", null);
exports.InputIntegrationController = InputIntegrationController = tslib_1.__decorate([
    (0, Controller_1.Controller)('/input-integration'),
    tslib_1.__param(0, (0, inversify_1.inject)(InputAdapter_1.InputAdapter)),
    tslib_1.__param(1, (0, inversify_1.inject)(InputPrioritizer_1.InputPrioritizer)),
    tslib_1.__param(2, (0, inversify_1.inject)(InputMerger_1.InputMerger)),
    tslib_1.__param(3, (0, inversify_1.inject)(InputRouter_1.InputRouter)),
    tslib_1.__param(4, (0, inversify_1.inject)(AITaskRepository_1.AITaskRepository)),
    tslib_1.__metadata("design:paramtypes", [InputAdapter_1.InputAdapter,
        InputPrioritizer_1.InputPrioritizer,
        InputMerger_1.InputMerger,
        InputRouter_1.InputRouter, Object])
], InputIntegrationController);
//# sourceMappingURL=InputIntegrationController.js.map