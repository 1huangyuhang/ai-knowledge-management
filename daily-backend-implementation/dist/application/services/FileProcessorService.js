"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProcessorServiceImpl = void 0;
class FileProcessorServiceImpl {
    documentParserService;
    ocrService;
    constructor(documentParserService, ocrService) {
        this.documentParserService = documentParserService;
        this.ocrService = ocrService;
    }
    async processFile(fileInput) {
        const fileType = this.getFileType(fileInput.name);
        if (!this.isSupported(fileType)) {
            throw new Error(`Unsupported file type: ${fileType}`);
        }
        let text;
        if (this.isDocumentType(fileType)) {
            text = await this.documentParserService.parseDocument(fileInput.content, fileType);
        }
        else if (this.isImageType(fileType)) {
            text = await this.ocrService.extractText(fileInput.content, fileType);
        }
        else {
            throw new Error(`Unsupported file type: ${fileType}`);
        }
        const updatedFile = fileInput.updateMetadata({
            processed: true,
            processedAt: new Date().toISOString(),
            extractedTextLength: text.length
        });
        return {
            text,
            processedFile: updatedFile
        };
    }
    isSupported(fileType) {
        return this.isDocumentType(fileType) || this.isImageType(fileType);
    }
    isDocumentType(fileType) {
        return this.documentParserService.isSupported(fileType);
    }
    isImageType(fileType) {
        return this.ocrService.isSupported(fileType);
    }
    getFileType(fileName) {
        const parts = fileName.split('.');
        if (parts.length < 2) {
            throw new Error('File has no extension');
        }
        return parts[parts.length - 1].toLowerCase();
    }
}
exports.FileProcessorServiceImpl = FileProcessorServiceImpl;
//# sourceMappingURL=FileProcessorService.js.map