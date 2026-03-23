import { UpdateSource } from '../model-update-service';
export declare enum ModelEvolutionEventType {
    MODEL_CREATED = "MODEL_CREATED",
    MODEL_UPDATED = "MODEL_UPDATED",
    CONCEPT_ADDED = "CONCEPT_ADDED",
    CONCEPT_UPDATED = "CONCEPT_UPDATED",
    CONCEPT_REMOVED = "CONCEPT_REMOVED",
    RELATION_ADDED = "RELATION_ADDED",
    RELATION_UPDATED = "RELATION_UPDATED",
    RELATION_REMOVED = "RELATION_REMOVED",
    MODEL_RESTRUCTURED = "MODEL_RESTRUCTURED",
    MODEL_VERSIONED = "MODEL_VERSIONED"
}
export interface ModelEvolutionEvent {
    id: string;
    userId: string;
    type: ModelEvolutionEventType;
    version: string;
    timestamp: Date;
    data: {
        conceptIds?: string[];
        relationIds?: string[];
        fromVersion?: string;
        toVersion?: string;
        source?: UpdateSource;
        confidenceScore?: number;
        relatedThoughtIds?: string[];
        description?: string;
    };
    metadata: {
        systemVersion: string;
        nodeId: string;
        isSystemEvent: boolean;
    };
}
//# sourceMappingURL=model-evolution-event.d.ts.map