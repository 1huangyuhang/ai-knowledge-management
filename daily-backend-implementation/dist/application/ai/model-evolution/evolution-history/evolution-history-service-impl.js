"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionHistoryServiceImpl = void 0;
const uuid_1 = require("uuid");
const evolution_history_types_1 = require("../types/evolution-history.types");
class EvolutionHistoryServiceImpl {
    evolutionEventRepository;
    modelSnapshotService;
    versionComparisonService;
    constructor(evolutionEventRepository, modelSnapshotService, versionComparisonService) {
        this.evolutionEventRepository = evolutionEventRepository;
        this.modelSnapshotService = modelSnapshotService;
        this.versionComparisonService = versionComparisonService;
    }
    async recordEvolutionEvent(event) {
        try {
            this.validateEvolutionEvent(event);
            if (!event.metadata) {
                event.metadata = {
                    systemVersion: process.env.SYSTEM_VERSION || 'unknown',
                    nodeId: process.env.NODE_ID || 'localhost',
                    isSystemEvent: false
                };
            }
            await this.evolutionEventRepository.save(event);
            if (event.type === evolution_history_types_1.ModelEvolutionEventType.MODEL_VERSIONED) {
            }
            return true;
        }
        catch (error) {
            console.error('Failed to record evolution event:', error);
            return false;
        }
    }
    async getEvolutionHistory(userId, options) {
        try {
            const query = this.buildEvolutionEventQuery(userId, options);
            const events = await this.evolutionEventRepository.find(query);
            events.sort((a, b) => {
                const sortOrder = options?.sortOrder === 'desc' ? -1 : 1;
                if (options?.sortBy === 'version') {
                    return a.version.localeCompare(b.version) * sortOrder;
                }
                return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * sortOrder;
            });
            if (options?.limit) {
                const offset = options.offset || 0;
                return events.slice(offset, offset + options.limit);
            }
            return events;
        }
        catch (error) {
            console.error('Failed to get evolution history:', error);
            return [];
        }
    }
    async getModelSnapshot(userId, versionId) {
        try {
            return await this.modelSnapshotService.getModelSnapshot(userId, versionId);
        }
        catch (error) {
            console.error('Failed to get model snapshot:', error);
            return null;
        }
    }
    async getVersionDiff(userId, fromVersion, toVersion) {
        try {
            return await this.versionComparisonService.compareVersions(userId, fromVersion, toVersion);
        }
        catch (error) {
            console.error('Failed to get version diff:', error);
            throw new Error('Failed to get version diff');
        }
    }
    async cleanupOldHistory(userId, retentionPolicy) {
        try {
            const endTime = new Date();
            endTime.setDate(endTime.getDate() - retentionPolicy.retentionDays);
            const startTime = new Date(0);
            const eventsCleaned = await this.evolutionEventRepository.deleteByTimeRange(startTime, endTime);
            const snapshotsCleaned = 0;
            const eventsArchived = 0;
            const snapshotsArchived = 0;
            return {
                eventsCleaned,
                snapshotsCleaned,
                eventsArchived,
                snapshotsArchived,
                cleanupTime: new Date()
            };
        }
        catch (error) {
            console.error('Failed to cleanup old history:', error);
            throw new Error('Failed to cleanup old history');
        }
    }
    async exportEvolutionHistory(userId, format, options) {
        try {
            const queryOptions = {
                startTime: options?.startTime,
                endTime: options?.endTime,
                eventTypes: options?.eventTypes
            };
            const events = await this.getEvolutionHistory(userId, queryOptions);
            let snapshots = [];
            if (options?.includeSnapshots) {
                snapshots = await this.modelSnapshotService.getSnapshots(userId);
            }
            let data;
            switch (format) {
                case evolution_history_types_1.ExportFormat.JSON:
                    data = JSON.stringify({ events, snapshots }, null, 2);
                    break;
                case evolution_history_types_1.ExportFormat.CSV:
                    data = this.exportToCsv(events, snapshots);
                    break;
                case evolution_history_types_1.ExportFormat.XML:
                    data = this.exportToXml(events, snapshots);
                    break;
                default:
                    data = JSON.stringify({ events, snapshots }, null, 2);
            }
            return {
                id: (0, uuid_1.v4)(),
                exportTime: new Date(),
                format,
                data,
                metadata: {
                    eventCount: events.length,
                    snapshotCount: snapshots.length,
                    sizeInBytes: Buffer.byteLength(data, 'utf8')
                }
            };
        }
        catch (error) {
            console.error('Failed to export evolution history:', error);
            throw new Error('Failed to export evolution history');
        }
    }
    async getEvolutionStatistics(userId, timeRange) {
        try {
            const events = await this.getEvolutionHistory(userId, {
                startTime: timeRange.startTime,
                endTime: timeRange.endTime
            });
            const eventStats = {
                totalEvents: events.length,
                eventTypeDistribution: this.calculateEventTypeDistribution(events),
                dailyAverage: this.calculateDailyAverage(events, timeRange)
            };
            const snapshots = await this.modelSnapshotService.getSnapshots(userId, {
                startTime: timeRange.startTime,
                endTime: timeRange.endTime
            });
            const snapshotStats = {
                totalSnapshots: snapshots.length,
                snapshotTypeDistribution: this.calculateSnapshotTypeDistribution(snapshots),
                modelSizeChange: {
                    startSize: 0,
                    endSize: 0,
                    change: 0,
                    changePercentage: 0
                }
            };
            const structureStats = {
                conceptCountChange: {
                    startCount: 0,
                    endCount: 0,
                    change: 0,
                    changePercentage: 0
                },
                relationCountChange: {
                    startCount: 0,
                    endCount: 0,
                    change: 0,
                    changePercentage: 0
                }
            };
            return {
                id: (0, uuid_1.v4)(),
                userId,
                timeRange,
                eventStats,
                snapshotStats,
                structureStats
            };
        }
        catch (error) {
            console.error('Failed to get evolution statistics:', error);
            throw new Error('Failed to get evolution statistics');
        }
    }
    validateEvolutionEvent(event) {
        if (!event.id) {
            throw new Error('Event ID is required');
        }
        if (!event.userId) {
            throw new Error('User ID is required');
        }
        if (!event.type) {
            throw new Error('Event type is required');
        }
        if (!event.version) {
            throw new Error('Version is required');
        }
        if (!event.timestamp) {
            throw new Error('Timestamp is required');
        }
    }
    buildEvolutionEventQuery(userId, options) {
        const query = { userId };
        if (options?.eventTypes) {
            query.type = { $in: options.eventTypes };
        }
        if (options?.startTime) {
            query.timestamp = { $gte: options.startTime };
        }
        if (options?.endTime) {
            query.timestamp = { ...query.timestamp, $lte: options.endTime };
        }
        if (options?.versions) {
            query.version = { $in: options.versions };
        }
        return query;
    }
    calculateEventTypeDistribution(events) {
        const distribution = {};
        events.forEach(event => {
            distribution[event.type] = (distribution[event.type] || 0) + 1;
        });
        return distribution;
    }
    calculateSnapshotTypeDistribution(snapshots) {
        const distribution = {};
        snapshots.forEach(snapshot => {
            distribution[snapshot.type] = (distribution[snapshot.type] || 0) + 1;
        });
        return distribution;
    }
    calculateDailyAverage(events, timeRange) {
        const days = (timeRange.endTime.getTime() - timeRange.startTime.getTime()) / (1000 * 60 * 60 * 24);
        return days > 0 ? events.length / days : events.length;
    }
    exportToCsv(events, snapshots) {
        let csv = 'Event ID,User ID,Event Type,Version,Timestamp,Description\n';
        events.forEach(event => {
            csv += `${event.id},${event.userId},${event.type},${event.version},${event.timestamp.toISOString()},${event.data.description || ''}\n`;
        });
        return csv;
    }
    exportToXml(events, snapshots) {
        let xml = '<EvolutionHistory>\n';
        xml += '  <Events>\n';
        events.forEach(event => {
            xml += `    <Event>\n`;
            xml += `      <Id>${event.id}</Id>\n`;
            xml += `      <UserId>${event.userId}</UserId>\n`;
            xml += `      <Type>${event.type}</Type>\n`;
            xml += `      <Version>${event.version}</Version>\n`;
            xml += `      <Timestamp>${event.timestamp.toISOString()}</Timestamp>\n`;
            xml += `      <Description>${event.data.description || ''}</Description>\n`;
            xml += `    </Event>\n`;
        });
        xml += '  </Events>\n';
        xml += '</EvolutionHistory>\n';
        return xml;
    }
}
exports.EvolutionHistoryServiceImpl = EvolutionHistoryServiceImpl;
//# sourceMappingURL=evolution-history-service-impl.js.map