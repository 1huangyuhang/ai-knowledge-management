"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSpeechToTextRoutes = configureSpeechToTextRoutes;
const tslib_1 = require("tslib");
const SpeechToTextController_1 = require("../controllers/SpeechToTextController");
const multipart_1 = tslib_1.__importDefault(require("@fastify/multipart"));
async function configureSpeechToTextRoutes(app) {
    await app.register(multipart_1.default, {
        limits: {
            fileSize: 50 * 1024 * 1024,
            files: 1
        }
    });
    const speechToTextController = new SpeechToTextController_1.SpeechToTextController();
    app.post('/speech-to-text', {
        schema: {
            summary: '上传语音文件并转换为文本',
            description: '上传语音文件并使用AI转换为文本',
            tags: ['语音处理'],
            consumes: ['multipart/form-data'],
            response: {
                200: {
                    description: '语音转文本成功',
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                speechId: { type: 'string' },
                                audioUrl: { type: 'string' },
                                transcription: { type: 'string' },
                                confidence: { type: 'number' },
                                language: { type: 'string' },
                                duration: { type: 'number' },
                                metadata: { type: 'object' }
                            }
                        }
                    }
                }
            }
        }
    }, (request, reply) => speechToTextController.speechToText(request, reply));
    app.get('/speech-to-text/:speechId', {
        schema: {
            summary: '获取语音转文本结果',
            description: '根据语音ID获取语音转文本结果',
            tags: ['语音处理'],
            params: {
                type: 'object',
                properties: {
                    speechId: { type: 'string' }
                },
                required: ['speechId']
            },
            response: {
                200: {
                    description: '获取语音转文本结果成功',
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                speechId: { type: 'string' },
                                audioUrl: { type: 'string' },
                                transcription: { type: 'string' },
                                confidence: { type: 'number' },
                                language: { type: 'string' },
                                duration: { type: 'number' },
                                metadata: { type: 'object' }
                            }
                        }
                    }
                }
            }
        }
    }, (request, reply) => speechToTextController.getSpeechToTextResult(request, reply));
}
//# sourceMappingURL=speech-to-text.route.js.map