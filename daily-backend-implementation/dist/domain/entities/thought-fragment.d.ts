export interface ThoughtFragment {
    readonly id: string;
    content: string;
    metadata: Record<string, any>;
    readonly userId: string;
    readonly createdAt: Date;
    updatedAt: Date;
    isProcessed: boolean;
    processingAttempts: number;
    lastProcessedAt: Date | null;
    updateContent(content: string): void;
    updateMetadata(metadata: Record<string, any>): void;
    markAsProcessed(): void;
    markAsUnprocessed(): void;
    incrementProcessingAttempts(): void;
}
export declare class ThoughtFragmentImpl implements ThoughtFragment {
    readonly id: string;
    content: string;
    metadata: Record<string, any>;
    readonly userId: string;
    readonly createdAt: Date;
    updatedAt: Date;
    isProcessed: boolean;
    processingAttempts: number;
    lastProcessedAt: Date | null;
    constructor(id: string, content: string, userId: string, metadata?: Record<string, any>, isProcessed?: boolean, processingAttempts?: number, lastProcessedAt?: Date | null, createdAt?: Date);
    updateContent(content: string): void;
    updateMetadata(metadata: Record<string, any>): void;
    markAsProcessed(): void;
    markAsUnprocessed(): void;
    incrementProcessingAttempts(): void;
}
//# sourceMappingURL=thought-fragment.d.ts.map