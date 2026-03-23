import { UUID } from '../value-objects/UUID';
export declare class InputAnalysis {
    readonly id: UUID;
    readonly inputId: UUID;
    readonly type: string;
    readonly result: Record<string, any>;
    readonly status: AnalysisStatus;
    readonly confidence: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: {
        id?: UUID;
        inputId: UUID;
        type: string;
        result: Record<string, any>;
        status: AnalysisStatus;
        confidence: number;
        createdAt?: Date;
        updatedAt?: Date;
    });
    update(result: Record<string, any>, confidence: number, status: AnalysisStatus): InputAnalysis;
}
export declare enum AnalysisStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum AnalysisType {
    KEYWORD_EXTRACTION = "keyword_extraction",
    TOPIC_RECOGNITION = "topic_recognition",
    SENTIMENT_ANALYSIS = "sentiment_analysis",
    CONTENT_CLASSIFICATION = "content_classification",
    SUMMARIZATION = "summarization",
    ENTITY_RECOGNITION = "entity_recognition",
    RELATION_EXTRACTION = "relation_extraction",
    READABILITY_ANALYSIS = "readability_analysis"
}
//# sourceMappingURL=InputAnalysis.d.ts.map