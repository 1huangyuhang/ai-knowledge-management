import { DocumentParserService } from './DocumentParserService';
import { OCRService } from './OCRService';
import { FileInput } from '../../domain/entities/file-input';
export interface FileProcessorService {
    processFile(fileInput: FileInput): Promise<{
        text: string;
        processedFile: FileInput;
    }>;
    isSupported(fileType: string): boolean;
}
export declare class FileProcessorServiceImpl implements FileProcessorService {
    private documentParserService;
    private ocrService;
    constructor(documentParserService: DocumentParserService, ocrService: OCRService);
    processFile(fileInput: FileInput): Promise<{
        text: string;
        processedFile: FileInput;
    }>;
    isSupported(fileType: string): boolean;
    private isDocumentType;
    private isImageType;
    private getFileType;
}
//# sourceMappingURL=FileProcessorService.d.ts.map