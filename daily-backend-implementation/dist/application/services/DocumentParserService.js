"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentParserServiceImpl = void 0;
class DocumentParserServiceImpl {
    supportedTypes = ['txt', 'pdf', 'docx', 'xlsx', 'csv'];
    async parseDocument(fileContent, fileType) {
        if (!this.isSupported(fileType)) {
            throw new Error(`Unsupported file type: ${fileType}`);
        }
        switch (fileType) {
            case 'txt':
                return this.parseText(fileContent);
            case 'pdf':
                return this.parsePdf(fileContent);
            case 'docx':
                return this.parseDocx(fileContent);
            case 'xlsx':
                return this.parseXlsx(fileContent);
            case 'csv':
                return this.parseCsv(fileContent);
            default:
                throw new Error(`Unsupported file type: ${fileType}`);
        }
    }
    isSupported(fileType) {
        return this.supportedTypes.includes(fileType.toLowerCase());
    }
    parseText(fileContent) {
        return fileContent.toString('utf-8');
    }
    async parsePdf(fileContent) {
        return 'PDF content extraction is not implemented yet';
    }
    async parseDocx(fileContent) {
        return 'DOCX content extraction is not implemented yet';
    }
    async parseXlsx(fileContent) {
        return 'XLSX content extraction is not implemented yet';
    }
    parseCsv(fileContent) {
        return fileContent.toString('utf-8');
    }
}
exports.DocumentParserServiceImpl = DocumentParserServiceImpl;
//# sourceMappingURL=DocumentParserService.js.map