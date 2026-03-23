export interface OCRService {
    extractText(imageContent: Buffer, imageType: string): Promise<string>;
    isSupported(imageType: string): boolean;
}
export declare class OCRServiceImpl implements OCRService {
    private supportedTypes;
    extractText(imageContent: Buffer, imageType: string): Promise<string>;
    isSupported(imageType: string): boolean;
}
//# sourceMappingURL=OCRService.d.ts.map