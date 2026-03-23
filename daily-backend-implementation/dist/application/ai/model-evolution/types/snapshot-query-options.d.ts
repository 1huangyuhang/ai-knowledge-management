import { SnapshotType } from './model-snapshot';
export interface SnapshotQueryOptions {
    types?: SnapshotType[];
    startTime?: Date;
    endTime?: Date;
    versionRange?: {
        fromVersion?: string;
        toVersion?: string;
    };
    pagination?: {
        page: number;
        pageSize: number;
    };
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
}
//# sourceMappingURL=snapshot-query-options.d.ts.map