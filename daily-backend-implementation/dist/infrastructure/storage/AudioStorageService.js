"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalAudioStorageService = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
let LocalAudioStorageService = class LocalAudioStorageService {
    audioDir;
    constructor() {
        this.audioDir = './audio-uploads';
        this.ensureAudioDirExists();
    }
    ensureAudioDirExists() {
        const fs = require('fs');
        if (!fs.existsSync(this.audioDir)) {
            fs.mkdirSync(this.audioDir, { recursive: true });
        }
    }
    async saveAudio(audio, filename, mimeType) {
        const fs = require('fs');
        const path = require('path');
        const timestamp = Date.now();
        const extension = path.extname(filename) || this.getExtensionFromMimeType(mimeType);
        const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(2, 10)}${extension}`;
        const audioPath = path.join(this.audioDir, uniqueFilename);
        await fs.promises.writeFile(audioPath, audio);
        return audioPath;
    }
    getExtensionFromMimeType(mimeType) {
        const mimeToExt = {
            'audio/mpeg': '.mp3',
            'audio/wav': '.wav',
            'audio/mp4': '.m4a',
            'audio/ogg': '.ogg',
            'audio/webm': '.webm',
            'audio/flac': '.flac',
            'audio/aac': '.aac'
        };
        return mimeToExt[mimeType] || '.mp3';
    }
    async getAudioPath(audioId) {
        const path = require('path');
        const audioPath = path.join(this.audioDir, audioId);
        return audioPath;
    }
    async deleteAudio(audioId) {
        const fs = require('fs');
        const path = require('path');
        try {
            const audioPath = path.join(this.audioDir, audioId);
            await fs.promises.unlink(audioPath);
            return true;
        }
        catch (error) {
            console.error('Error deleting audio:', error);
            return false;
        }
    }
    async getAudioUrl(audioId) {
        return `/audio-uploads/${audioId}`;
    }
    async audioExists(audioId) {
        const fs = require('fs');
        const path = require('path');
        const audioPath = path.join(this.audioDir, audioId);
        return fs.existsSync(audioPath);
    }
    async getAudioMetadata(audioId) {
        const fs = require('fs');
        const path = require('path');
        const audioPath = path.join(this.audioDir, audioId);
        const stats = await fs.promises.stat(audioPath);
        return {
            filename: audioId,
            mimeType: 'audio/mpeg',
            size: stats.size,
            duration: undefined,
            sampleRate: undefined,
            bitRate: undefined,
            createdAt: stats.birthtime,
            updatedAt: stats.mtime
        };
    }
};
exports.LocalAudioStorageService = LocalAudioStorageService;
exports.LocalAudioStorageService = LocalAudioStorageService = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], LocalAudioStorageService);
//# sourceMappingURL=AudioStorageService.js.map