export interface HistoryRetentionPolicy {
    eventRetentionDays: number;
    snapshotRetentionDays: number;
    keepLatestSnapshots: boolean;
    latestSnapshotsToKeep: number;
    keepVersionedSnapshots: boolean;
    versionedRetentionPolicy?: {
        majorVersions?: number;
        minorVersionsPerMajor?: number;
    };
}
//# sourceMappingURL=history-retention-policy.d.ts.map