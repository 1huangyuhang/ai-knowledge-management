export interface DocumentParserService {
    parseDocument(fileContent: Buffer, fileType: string): Promise<string>;
    isSupported(fileType: string): boolean;
}
export declare class DocumentParserServiceImpl implements DocumentParserService {
    private supportedTypes;
    parseDocument(fileContent: Buffer, fileType: string): Promise<string>;
    isSupported(fileType: string): boolean;
    private parseText;
    private parsePdf;
    private parseDocx;
    private parseXlsx;
    private parseCsv;
}
//# sourceMappingURL=DocumentParserService.d.ts.map