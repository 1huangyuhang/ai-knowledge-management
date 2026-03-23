"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalFileStorageService = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
let LocalFileStorageService = class LocalFileStorageService {
    uploadsDir;
    constructor() {
        this.uploadsDir = './uploads';
        this.ensureUploadsDirExists();
    }
    ensureUploadsDirExists() {
        const fs = require('fs');
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }
    async saveFile(file, filename, mimeType) {
        const fs = require('fs');
        const path = require('path');
        const timestamp = Date.now();
        const extension = path.extname(filename) || this.getExtensionFromMimeType(mimeType);
        const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(2, 10)}${extension}`;
        const filePath = path.join(this.uploadsDir, uniqueFilename);
        await fs.promises.writeFile(filePath, file);
        return filePath;
    }
    getExtensionFromMimeType(mimeType) {
        const mimeToExt = {
            'text/plain': '.txt',
            'text/html': '.html',
            'text/markdown': '.md',
            'application/pdf': '.pdf',
            'application/msword': '.doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/vnd.ms-excel': '.xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'audio/mpeg': '.mp3',
            'audio/wav': '.wav',
            'video/mp4': '.mp4'
        };
        return mimeToExt[mimeType] || '.bin';
    }
    async getFilePath(fileId) {
        const path = require('path');
        const filePath = path.join(this.uploadsDir, fileId);
        return filePath;
    }
    async deleteFile(fileId) {
        const fs = require('fs');
        const path = require('path');
        try {
            const filePath = path.join(this.uploadsDir, fileId);
            await fs.promises.unlink(filePath);
            return true;
        }
        catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }
    async getFileUrl(fileId) {
        return `/uploads/${fileId}`;
    }
    async fileExists(fileId) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(this.uploadsDir, fileId);
        return fs.existsSync(filePath);
    }
    async getFileMetadata(fileId) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(this.uploadsDir, fileId);
        const stats = await fs.promises.stat(filePath);
        return {
            filename: fileId,
            mimeType: 'application/octet-stream',
            size: stats.size,
            createdAt: stats.birthtime,
            updatedAt: stats.mtime
        };
    }
};
exports.LocalFileStorageService = LocalFileStorageService;
exports.LocalFileStorageService = LocalFileStorageService = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], LocalFileStorageService);
//# sourceMappingURL=FileStorageService.js.map