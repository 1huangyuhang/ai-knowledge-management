"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GapIdentificationKeys = void 0;
exports.initializeGapIdentificationDependencies = initializeGapIdentificationDependencies;
const container_1 = require("./container");
const gap_identification_service_impl_1 = require("../application/ai/cognitive-feedback/gap-identification-service-impl");
async function initializeGapIdentificationDependencies() {
    container_1.container.register('GapIdentificationService', () => {
        const cognitiveModelRepository = container_1.container.resolve('CognitiveModelRepository');
        return new gap_identification_service_impl_1.GapIdentificationServiceImpl(cognitiveModelRepository);
    }, true);
    console.log('Gap identification dependencies initialized and registered in DI container');
}
exports.GapIdentificationKeys = {
    GapIdentificationService: 'GapIdentificationService'
};
//# sourceMappingURL=gap-identification.config.js.map