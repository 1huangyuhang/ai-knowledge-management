"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertChannel = exports.AlertStatus = exports.AlertLevel = exports.MonitorType = void 0;
var MonitorType;
(function (MonitorType) {
    MonitorType["CPU"] = "CPU";
    MonitorType["MEMORY"] = "MEMORY";
    MonitorType["DISK"] = "DISK";
    MonitorType["NETWORK"] = "NETWORK";
    MonitorType["APP_PERFORMANCE"] = "APP_PERFORMANCE";
    MonitorType["DATABASE"] = "DATABASE";
    MonitorType["API"] = "API";
    MonitorType["ERROR"] = "ERROR";
    MonitorType["BUSINESS"] = "BUSINESS";
})(MonitorType || (exports.MonitorType = MonitorType = {}));
var AlertLevel;
(function (AlertLevel) {
    AlertLevel["INFO"] = "INFO";
    AlertLevel["WARNING"] = "WARNING";
    AlertLevel["ERROR"] = "ERROR";
    AlertLevel["CRITICAL"] = "CRITICAL";
})(AlertLevel || (exports.AlertLevel = AlertLevel = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["PENDING"] = "PENDING";
    AlertStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
    AlertStatus["RESOLVED"] = "RESOLVED";
    AlertStatus["CLOSED"] = "CLOSED";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
var AlertChannel;
(function (AlertChannel) {
    AlertChannel["EMAIL"] = "EMAIL";
    AlertChannel["SMS"] = "SMS";
    AlertChannel["WEBHOOK"] = "WEBHOOK";
    AlertChannel["SLACK"] = "SLACK";
    AlertChannel["TEAMS"] = "TEAMS";
    AlertChannel["CUSTOM"] = "CUSTOM";
})(AlertChannel || (exports.AlertChannel = AlertChannel = {}));
//# sourceMappingURL=MonitoringConfig.js.map