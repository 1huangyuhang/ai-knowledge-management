"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechInput = void 0;
const uuid_1 = require("../value-objects/uuid");
class SpeechInput {
    _id;
    _audioUrl;
    _transcription;
    _confidence;
    _language;
    _duration;
    _metadata;
    _createdAt;
    _updatedAt;
    _userId;
    constructor(props) {
        this._id = props.id || uuid_1.UUID.create();
        this._audioUrl = props.audioUrl;
        this._transcription = props.transcription;
        this._confidence = props.confidence;
        this._language = props.language;
        this._duration = props.duration;
        this._metadata = props.metadata;
        this._createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
        this._userId = props.userId;
    }
    get id() {
        return this._id;
    }
    get audioUrl() {
        return this._audioUrl;
    }
    get transcription() {
        return this._transcription;
    }
    get confidence() {
        return this._confidence;
    }
    get language() {
        return this._language;
    }
    get duration() {
        return this._duration;
    }
    get metadata() {
        return this._metadata;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    get userId() {
        return this._userId;
    }
    updateTranscription(transcription, confidence) {
        this._transcription = transcription;
        this._confidence = confidence;
        this._updatedAt = new Date();
    }
    updateMetadata(metadata) {
        this._metadata = { ...this._metadata, ...metadata };
        this._updatedAt = new Date();
    }
}
exports.SpeechInput = SpeechInput;
//# sourceMappingURL=speech-input.js.map