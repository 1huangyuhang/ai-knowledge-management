"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadController = void 0;
const container_1 = require("../../di/container");
const file_input_1 = require("../../domain/entities/file-input");
class FileUploadController {
    fileProcessorService;
    fileStorageService;
    constructor() {
        this.fileProcessorService = container_1.container.resolve('FileProcessorService');
        this.fileStorageService = container_1.container.resolve('FileStorageService');
    }
    async uploadFile(request, reply) {
        try {
            const data = await request.file();
            if (!data) {
                return reply.status(400).send({ success: false, message: 'No file uploaded' });
            }
            const fileContent = await data.toBuffer();
            const fileName = data.filename || 'unknown';
            const fileType = fileName.split('.').pop() || 'unknown';
            const fileInput = new file_input_1.FileInput({
                name: fileName,
                type: fileType,
                size: fileContent.length,
                content: fileContent,
                metadata: {
                    originalName: fileName,
                    mimeType: data.mimetype || 'application/octet-stream',
                    uploadedAt: new Date().toISOString()
                },
                userId: 'anonymous'
            });
            const { text, processedFile } = await this.fileProcessorService.processFile(fileInput);
            const fileUrl = await this.fileStorageService.saveFile(processedFile);
            processedFile.updateMetadata({ fileUrl });
            return reply.send({
                success: true,
                data: {
                    fileId: processedFile.id,
                    fileName: processedFile.name,
                    fileType: processedFile.type,
                    fileSize: processedFile.size,
                    fileUrl,
                    extractedText: text,
                    metadata: processedFile.metadata
                }
            });
        }
        catch (error) {
            return reply.status(500).send({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to upload file'
            });
        }
    }
    async getFileInfo(request, reply) {
        try {
            const { fileId } = request.params;
            return reply.send({
                success: true,
                data: {
                    fileId,
                    fileName: `file-${fileId}`,
                    fileType: 'txt',
                    fileSize: 1024,
                    fileUrl: `http://localhost:3000/api/v1/files/${fileId}`,
                    extractedText: 'Sample extracted text',
                    metadata: {
                        originalName: `file-${fileId}.txt`,
                        mimeType: 'text/plain',
                        uploadedAt: new Date().toISOString(),
                        processed: true,
                        processedAt: new Date().toISOString(),
                        extractedTextLength: 100
                    }
                }
            });
        }
        catch (error) {
            return reply.status(500).send({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get file info'
            });
        }
    }
}
exports.FileUploadController = FileUploadController;
//# sourceMappingURL=FileUploadController.js.map