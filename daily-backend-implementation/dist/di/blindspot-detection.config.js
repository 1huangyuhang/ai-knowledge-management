"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlindspotDetectionKeys = void 0;
exports.initializeBlindspotDetectionDependencies = initializeBlindspotDetectionDependencies;
const container_1 = require("./container");
const blindspot_detection_service_impl_1 = require("../application/ai/cognitive-feedback/blindspot-detection-service-impl");
async function initializeBlindspotDetectionDependencies() {
    container_1.container.register('BlindspotDetectionService', () => {
        const cognitiveModelRepository = container_1.container.resolve('CognitiveModelRepository');
        return new blindspot_detection_service_impl_1.BlindspotDetectionServiceImpl(cognitiveModelRepository);
    }, true);
    console.log('Blindspot detection dependencies initialized and registered in DI container');
}
exports.BlindspotDetectionKeys = {
    BlindspotDetectionService: 'BlindspotDetectionService'
};
//# sourceMappingURL=blindspot-detection.config.js.map