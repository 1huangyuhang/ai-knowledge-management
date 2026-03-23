"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputIntegrationController = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const InputAdapter_1 = require("../../application/adapters/InputAdapter");
const InputMerger_1 = require("../../application/services/InputMerger");
const InputPrioritizer_1 = require("../../application/services/InputPrioritizer");
const InputRouter_1 = require("../../application/services/InputRouter");
const file_input_1 = require("../../domain/entities/file-input");
const speech_input_1 = require("../../domain/entities/speech-input");
const ai_task_repository_1 = require("../../domain/repositories/ai-task-repository");
const uuid_1 = require("../../domain/value-objects/uuid");
let InputIntegrationController = class InputIntegrationController {
    inputAdapter;
    inputMerger;
    inputPrioritizer;
    inputRouter;
    inputRepository;
    aiTaskRepository;
    constructor(inputAdapter, inputMerger, inputPrioritizer, inputRouter, inputRepository, aiTaskRepository) {
        this.inputAdapter = inputAdapter;
        this.inputMerger = inputMerger;
        this.inputPrioritizer = inputPrioritizer;
        this.inputRouter = inputRouter;
        this.inputRepository = inputRepository;
        this.aiTaskRepository = aiTaskRepository;
    }
    async integrateInput(req, res) {
        try {
            const { input, type, metadata } = req.body;
            const userId = new uuid_1.UUID(req.user?.id || '');
            let inputEntity;
            let unifiedInput;
            switch (type) {
                case 'file':
                    inputEntity = file_input_1.FileInput.create({
                        name: input.name,
                        type: input.mimeType,
                        size: input.size,
                        content: input.content,
                        metadata: metadata || {},
                        userId
                    });
                    await this.inputRepository.saveFileInput(inputEntity);
                    unifiedInput = this.inputAdapter.adaptFileInput(inputEntity);
                    break;
                case 'speech':
                    inputEntity = speech_input_1.SpeechInput.create({
                        audioUrl: input.audioUrl,
                        transcription: input.transcription,
                        confidence: input.confidence || 0.0,
                        language: input.language || 'en',
                        duration: input.duration || 0.0,
                        metadata: metadata || {},
                        userId
                    });
                    await this.inputRepository.saveSpeechInput(inputEntity);
                    unifiedInput = this.inputAdapter.adaptSpeechInput(inputEntity);
                    break;
                case 'text':
                    inputEntity = thought_fragment_1.ThoughtFragment.create({
                        content: input.content,
                        metadata: metadata || {},
                        tags: input.tags || [],
                        userId
                    });
                    unifiedInput = this.inputAdapter.adaptTextInput(inputEntity);
                    break;
                default:
                    return res.status(400).send({
                        error: 'Invalid input type',
                        message: 'Input type must be one of: file, speech, text'
                    });
            }
            const prioritizedInput = this.inputPrioritizer.assignPriority(unifiedInput);
            const routeDestination = this.inputRouter.routeInput(prioritizedInput);
            const aiTask = await this.aiTaskRepository.create({
                type: 'COGNITIVE_ANALYSIS',
                input: prioritizedInput,
                status: 'PENDING',
                metadata: {
                    routeDestination,
                    source: prioritizedInput.source
                },
                userId
            });
            return res.status(200).send({
                message: 'Input integrated successfully',
                data: {
                    inputId: inputEntity.id.value,
                    aiTaskId: aiTask.id.value,
                    routeDestination,
                    priority: prioritizedInput.priority
                }
            });
        }
        catch (error) {
            return res.status(500).send({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
    async getInputHistory(req, res) {
        try {
            const { limit = 10, offset = 0 } = req.query;
            const userId = new uuid_1.UUID(req.user?.id || '');
            const inputHistory = await this.inputRepository.getUserInputHistory(userId, parseInt(limit), parseInt(offset));
            const unifiedInputs = inputHistory.map(input => {
                if (input instanceof file_input_1.FileInput) {
                    return this.inputAdapter.adaptFileInput(input);
                }
                else if (input instanceof speech_input_1.SpeechInput) {
                    return this.inputAdapter.adaptSpeechInput(input);
                }
                return this.inputAdapter.normalizeInput(input);
            });
            return res.status(200).send({
                message: 'Input history retrieved successfully',
                data: unifiedInputs
            });
        }
        catch (error) {
            return res.status(500).send({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
    async getInputStatistics(req, res) {
        try {
            const userId = new uuid_1.UUID(req.user?.id || '');
            const statistics = await this.inputRepository.getUserInputStatistics(userId);
            return res.status(200).send({
                message: 'Input statistics retrieved successfully',
                data: statistics
            });
        }
        catch (error) {
            return res.status(500).send({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
    async mergeInputs(req, res) {
        try {
            const { inputIds } = req.body;
            const userId = new uuid_1.UUID(req.user?.id || '');
            const inputs = [];
            for (const id of inputIds) {
                const fileInput = await this.inputRepository.getFileInputById(new uuid_1.UUID(id));
                if (fileInput) {
                    inputs.push(fileInput);
                    continue;
                }
                const speechInput = await this.inputRepository.getSpeechInputById(new uuid_1.UUID(id));
                if (speechInput) {
                    inputs.push(speechInput);
                }
            }
            const unifiedInputs = inputs.map(input => {
                if (input instanceof file_input_1.FileInput) {
                    return this.inputAdapter.adaptFileInput(input);
                }
                return this.inputAdapter.adaptSpeechInput(input);
            });
            const mergedInputs = this.inputMerger.mergeInputs(unifiedInputs);
            const mergedInput = mergedInputs[0];
            const prioritizedInput = this.inputPrioritizer.assignPriority(mergedInput);
            const aiTask = await this.aiTaskRepository.create({
                type: 'COGNITIVE_ANALYSIS',
                input: prioritizedInput,
                status: 'PENDING',
                metadata: {
                    merged: true,
                    originalInputs: inputIds,
                    source: mergedInput.source
                },
                userId
            });
            return res.status(200).send({
                message: 'Inputs merged successfully',
                data: {
                    mergedInput: prioritizedInput,
                    aiTaskId: aiTask.id.value
                }
            });
        }
        catch (error) {
            return res.status(500).send({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
};
exports.InputIntegrationController = InputIntegrationController;
exports.InputIntegrationController = InputIntegrationController = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__metadata("design:paramtypes", [InputAdapter_1.InputAdapter,
        InputMerger_1.InputMerger,
        InputPrioritizer_1.InputPrioritizer,
        InputRouter_1.InputRouter, Object, typeof (_a = typeof ai_task_repository_1.AITaskRepository !== "undefined" && ai_task_repository_1.AITaskRepository) === "function" ? _a : Object])
], InputIntegrationController);
//# sourceMappingURL=input-integration.controller.js.map