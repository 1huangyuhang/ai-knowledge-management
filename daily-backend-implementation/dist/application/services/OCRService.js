"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCRServiceImpl = void 0;
class OCRServiceImpl {
    supportedTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    async extractText(imageContent, imageType) {
        if (!this.isSupported(imageType)) {
            throw new Error(`Unsupported image type: ${imageType}`);
        }
        return 'This is sample text extracted from the image.';
    }
    isSupported(imageType) {
        return this.supportedTypes.includes(imageType.toLowerCase());
    }
}
exports.OCRServiceImpl = OCRServiceImpl;
//# sourceMappingURL=OCRService.js.map