export declare enum SnapshotType {
    AUTO = "AUTO",
    MANUAL = "MANUAL",
    VERSIONED = "VERSIONED",
    BACKUP = "BACKUP"
}
export interface ModelSnapshot {
    id: string;
    userId: string;
    version: string;
    createdAt: Date;
    type: SnapshotType;
    data: {
        conceptCount: number;
        relationCount: number;
        sizeInBytes: number;
        compressedModelData: string;
        modelHash: string;
    };
    metadata: {
        description?: string;
        creationReason?: string;
        systemVersion: string;
    };
}
//# sourceMappingURL=model-snapshot.d.ts.map