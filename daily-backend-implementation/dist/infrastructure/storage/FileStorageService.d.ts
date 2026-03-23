export interface FileStorageService {
    saveFile(file: Buffer, filename: string, mimeType: string): Promise<string>;
    getFilePath(fileId: string): Promise<string>;
    deleteFile(fileId: string): Promise<boolean>;
    getFileUrl(fileId: string): Promise<string>;
    fileExists(fileId: string): Promise<boolean>;
    getFileMetadata(fileId: string): Promise<{
        filename: string;
        mimeType: string;
        size: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare class LocalFileStorageService implements FileStorageService {
    private readonly uploadsDir;
    constructor();
    private ensureUploadsDirExists;
    saveFile(file: Buffer, filename: string, mimeType: string): Promise<string>;
    private getExtensionFromMimeType;
    getFilePath(fileId: string): Promise<string>;
    deleteFile(fileId: string): Promise<boolean>;
    getFileUrl(fileId: string): Promise<string>;
    fileExists(fileId: string): Promise<boolean>;
    getFileMetadata(fileId: string): Promise<{
        filename: string;
        mimeType: string;
        size: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=FileStorageService.d.ts.map