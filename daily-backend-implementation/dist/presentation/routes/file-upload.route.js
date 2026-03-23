"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureFileUploadRoutes = configureFileUploadRoutes;
const tslib_1 = require("tslib");
const FileUploadController_1 = require("../controllers/FileUploadController");
const multipart_1 = tslib_1.__importDefault(require("@fastify/multipart"));
async function configureFileUploadRoutes(app) {
    await app.register(multipart_1.default, {
        limits: {
            fileSize: 50 * 1024 * 1024,
            files: 1
        }
    });
    const fileUploadController = new FileUploadController_1.FileUploadController();
    app.post('/files/upload', {
        schema: {
            summary: '上传文件并处理',
            description: '上传文件并提取文本内容',
            tags: ['文件处理'],
            consumes: ['multipart/form-data'],
            response: {
                200: {
                    description: '文件上传成功',
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                fileId: { type: 'string' },
                                fileName: { type: 'string' },
                                fileType: { type: 'string' },
                                fileSize: { type: 'number' },
                                fileUrl: { type: 'string' },
                                extractedText: { type: 'string' },
                                metadata: { type: 'object' }
                            }
                        }
                    }
                }
            }
        }
    }, (request, reply) => fileUploadController.uploadFile(request, reply));
    app.get('/files/:fileId', {
        schema: {
            summary: '获取文件信息',
            description: '根据文件ID获取文件信息',
            tags: ['文件处理'],
            params: {
                type: 'object',
                properties: {
                    fileId: { type: 'string' }
                },
                required: ['fileId']
            },
            response: {
                200: {
                    description: '获取文件信息成功',
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                fileId: { type: 'string' },
                                fileName: { type: 'string' },
                                fileType: { type: 'string' },
                                fileSize: { type: 'number' },
                                fileUrl: { type: 'string' },
                                extractedText: { type: 'string' },
                                metadata: { type: 'object' }
                            }
                        }
                    }
                }
            }
        }
    }, (request, reply) => fileUploadController.getFileInfo(request, reply));
}
//# sourceMappingURL=file-upload.route.js.map