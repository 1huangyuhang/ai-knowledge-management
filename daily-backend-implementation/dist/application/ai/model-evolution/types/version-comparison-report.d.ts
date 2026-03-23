import { ModelVersionDiff } from './model-version-diff';
export interface VersionComparisonSummary {
    version1: string;
    version2: string;
    comparisonTime: Date;
    totalChanges: number;
    changeDistribution: {
        added: number;
        updated: number;
        removed: number;
    };
    changePercentage: number;
}
export interface ChangeTrendAnalysis {
    trendType: string;
    description: string;
    strength: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
}
export interface VersionComparisonReport {
    reportId: string;
    userId: string;
    generatedAt: Date;
    summary: VersionComparisonSummary;
    detailedDiff: ModelVersionDiff;
    trendAnalysis: ChangeTrendAnalysis[];
    impactAssessment: {
        structuralImpact: 'low' | 'medium' | 'high';
        qualityImpact: 'low' | 'medium' | 'high';
        evolutionImpact: 'low' | 'medium' | 'high';
    };
    recommendations: string[];
    reportVersion: string;
}
//# sourceMappingURL=version-comparison-report.d.ts.map