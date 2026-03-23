"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestThoughtStep = void 0;
class IngestThoughtStep {
    ingestThoughtUseCase;
    constructor(ingestThoughtUseCase) {
        this.ingestThoughtUseCase = ingestThoughtUseCase;
    }
    async execute(input, context) {
        const result = await this.ingestThoughtUseCase.execute(input);
        context.set('thoughtId', result.id);
        return result;
    }
    getName() {
        return 'IngestThoughtStep';
    }
}
exports.IngestThoughtStep = IngestThoughtStep;
//# sourceMappingURL=ingest-thought.step.js.map