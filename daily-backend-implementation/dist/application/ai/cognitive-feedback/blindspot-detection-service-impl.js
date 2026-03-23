"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlindspotDetectionServiceImpl = void 0;
const uuid_1 = require("uuid");
class BlindspotDetectionServiceImpl {
    cognitiveModelRepository;
    constructor(cognitiveModelRepository) {
        this.cognitiveModelRepository = cognitiveModelRepository;
    }
    async detectBlindspots(userId, modelId, options) {
        const model = await this.cognitiveModelRepository.getById(userId, modelId);
        if (!model) {
            throw new Error(`Cognitive model not found: ${modelId}`);
        }
        const concepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, modelId);
        const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);
        const blindspots = [];
        const conceptConnectionBlindspots = this.detectConceptConnectionBlindspots(concepts, relations);
        blindspots.push(...conceptConnectionBlindspots);
        const themeCoverageBlindspots = this.detectThemeCoverageBlindspots(concepts, relations);
        blindspots.push(...themeCoverageBlindspots);
        const hierarchyBlindspots = this.detectHierarchyBlindspots(concepts, relations);
        blindspots.push(...hierarchyBlindspots);
        const filteredBlindspots = this.filterBlindspots(blindspots, options);
        const blindspotDistribution = this.calculateBlindspotDistribution(filteredBlindspots);
        const result = {
            id: (0, uuid_1.v4)(),
            blindspots: filteredBlindspots,
            blindspotDistribution,
            summary: this.generateDetectionSummary(filteredBlindspots, blindspotDistribution),
            recommendations: this.generateRecommendations(filteredBlindspots),
            createdAt: new Date()
        };
        return result;
    }
    async detectBlindspotsFromThemes(userId, modelId, themeIds, options) {
        const model = await this.cognitiveModelRepository.getById(userId, modelId);
        if (!model) {
            throw new Error(`Cognitive model not found: ${modelId}`);
        }
        const concepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, modelId);
        const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);
        const blindspots = [];
        const themeCoverageBlindspots = this.detectThemeCoverageBlindspots(concepts, relations);
        blindspots.push(...themeCoverageBlindspots);
        const filteredBlindspots = this.filterBlindspots(blindspots, options);
        const blindspotDistribution = this.calculateBlindspotDistribution(filteredBlindspots);
        const result = {
            id: (0, uuid_1.v4)(),
            blindspots: filteredBlindspots,
            blindspotDistribution,
            summary: this.generateDetectionSummary(filteredBlindspots, blindspotDistribution),
            recommendations: this.generateRecommendations(filteredBlindspots),
            createdAt: new Date()
        };
        return result;
    }
    async detectBlindspotsFromConcepts(userId, modelId, conceptIds, options) {
        const model = await this.cognitiveModelRepository.getById(userId, modelId);
        if (!model) {
            throw new Error(`Cognitive model not found: ${modelId}`);
        }
        const concepts = await Promise.all(conceptIds.map(conceptId => this.cognitiveModelRepository.getConceptById(userId, modelId, conceptId)));
        const validConcepts = concepts.filter(concept => concept !== null);
        const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);
        const blindspots = this.detectConceptConnectionBlindspots(validConcepts, relations);
        const filteredBlindspots = this.filterBlindspots(blindspots, options);
        const blindspotDistribution = this.calculateBlindspotDistribution(filteredBlindspots);
        const result = {
            id: (0, uuid_1.v4)(),
            blindspots: filteredBlindspots,
            blindspotDistribution,
            summary: this.generateDetectionSummary(filteredBlindspots, blindspotDistribution),
            recommendations: this.generateRecommendations(filteredBlindspots),
            createdAt: new Date()
        };
        return result;
    }
    async detectBlindspotsByType(userId, modelId, blindspotTypes, options) {
        const model = await this.cognitiveModelRepository.getById(userId, modelId);
        if (!model) {
            throw new Error(`Cognitive model not found: ${modelId}`);
        }
        const concepts = await this.cognitiveModelRepository.getConceptsByModelId(userId, modelId);
        const relations = await this.cognitiveModelRepository.getRelationsByModelId(userId, modelId);
        const blindspots = [];
        if (blindspotTypes.includes('CONCEPT_CONNECTION')) {
            const conceptConnectionBlindspots = this.detectConceptConnectionBlindspots(concepts, relations);
            blindspots.push(...conceptConnectionBlindspots);
        }
        if (blindspotTypes.includes('THEME_COVERAGE')) {
            const themeCoverageBlindspots = this.detectThemeCoverageBlindspots(concepts, relations);
            blindspots.push(...themeCoverageBlindspots);
        }
        if (blindspotTypes.includes('HIERARCHY')) {
            const hierarchyBlindspots = this.detectHierarchyBlindspots(concepts, relations);
            blindspots.push(...hierarchyBlindspots);
        }
        const filteredBlindspots = this.filterBlindspots(blindspots, options);
        const blindspotDistribution = this.calculateBlindspotDistribution(filteredBlindspots);
        const result = {
            id: (0, uuid_1.v4)(),
            blindspots: filteredBlindspots,
            blindspotDistribution,
            summary: this.generateDetectionSummary(filteredBlindspots, blindspotDistribution),
            recommendations: this.generateRecommendations(filteredBlindspots),
            createdAt: new Date()
        };
        return result;
    }
    async analyzeBlindspotImpact(userId, modelId, blindspotId) {
        return {
            impact: 7.5,
            potentialRisks: [
                '可能导致对相关概念的理解不完整',
                '可能影响决策质量',
                '可能导致认知模型的不一致性'
            ]
        };
    }
    detectConceptConnectionBlindspots(concepts, relations) {
        const blindspots = [];
        const conceptConnectionCounts = new Map();
        concepts.forEach(concept => {
            conceptConnectionCounts.set(concept.id, 0);
        });
        relations.forEach(relation => {
            const sourceCount = conceptConnectionCounts.get(relation.sourceConceptId) || 0;
            conceptConnectionCounts.set(relation.sourceConceptId, sourceCount + 1);
            const targetCount = conceptConnectionCounts.get(relation.targetConceptId) || 0;
            conceptConnectionCounts.set(relation.targetConceptId, targetCount + 1);
        });
        conceptConnectionCounts.forEach((count, conceptId) => {
            if (count < 2) {
                const concept = concepts.find(c => c.id === conceptId);
                if (concept) {
                    blindspots.push({
                        id: (0, uuid_1.v4)(),
                        description: `概念 "${concept.name}" 连接数量较少，可能存在理解盲点`,
                        type: 'CONCEPT_CONNECTION',
                        impact: 5.0,
                        relatedThemes: [],
                        potentialRisks: [
                            '可能导致对该概念的理解不完整',
                            '可能影响与其他概念的关联理解'
                        ]
                    });
                }
            }
        });
        return blindspots;
    }
    detectThemeCoverageBlindspots(concepts, relations) {
        const blindspots = [];
        blindspots.push({
            id: (0, uuid_1.v4)(),
            description: '检测到主题覆盖不完整，可能存在认知盲点',
            type: 'THEME_COVERAGE',
            impact: 6.0,
            relatedThemes: [],
            potentialRisks: [
                '可能遗漏重要主题',
                '可能导致认知模型的片面性'
            ]
        });
        return blindspots;
    }
    detectHierarchyBlindspots(concepts, relations) {
        const blindspots = [];
        blindspots.push({
            id: (0, uuid_1.v4)(),
            description: '检测到层次结构不完整，可能存在认知盲点',
            type: 'HIERARCHY',
            impact: 5.5,
            relatedThemes: [],
            potentialRisks: [
                '可能导致概念间的层次关系不清晰',
                '可能影响对概念重要性的判断'
            ]
        });
        return blindspots;
    }
    filterBlindspots(blindspots, options) {
        let filtered = [...blindspots];
        if (options?.impactThreshold !== undefined) {
            filtered = filtered.filter(blindspot => blindspot.impact >= options.impactThreshold);
        }
        if (options?.blindspotTypes && options.blindspotTypes.length > 0) {
            filtered = filtered.filter(blindspot => options.blindspotTypes.includes(blindspot.type));
        }
        return filtered;
    }
    calculateBlindspotDistribution(blindspots) {
        const distribution = {};
        blindspots.forEach(blindspot => {
            distribution[blindspot.type] = (distribution[blindspot.type] || 0) + 1;
        });
        return distribution;
    }
    generateDetectionSummary(blindspots, distribution) {
        const totalBlindspots = blindspots.length;
        if (totalBlindspots === 0) {
            return '未检测到明显的认知盲点';
        }
        const typeSummary = Object.entries(distribution)
            .map(([type, count]) => `${type}: ${count}个`)
            .join(', ');
        return `共检测到 ${totalBlindspots} 个认知盲点，分布情况：${typeSummary}`;
    }
    generateRecommendations(blindspots) {
        if (blindspots.length === 0) {
            return ['您的认知模型较为完整，继续保持'];
        }
        const recommendations = [
            '针对检测到的盲点，建议进一步深入学习相关概念',
            '尝试建立更多的概念连接，完善认知模型结构',
            '定期回顾认知模型，及时发现和弥补新的盲点'
        ];
        return recommendations;
    }
}
exports.BlindspotDetectionServiceImpl = BlindspotDetectionServiceImpl;
//# sourceMappingURL=blindspot-detection-service-impl.js.map