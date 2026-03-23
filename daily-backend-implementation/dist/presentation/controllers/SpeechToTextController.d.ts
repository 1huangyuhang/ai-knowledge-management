import { FastifyRequest, FastifyReply } from 'fastify';
export declare class SpeechToTextController {
    private audioProcessorService;
    private speechRecognitionService;
    private audioStorageService;
    constructor();
    speechToText(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    getSpeechToTextResult(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
//# sourceMappingURL=SpeechToTextController.d.ts.map