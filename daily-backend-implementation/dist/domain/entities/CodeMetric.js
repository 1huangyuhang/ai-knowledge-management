"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeMetric = void 0;
class CodeMetric {
    name;
    value;
    unit;
    description;
    threshold;
    constructor(name, value, unit, description, threshold) {
        this.name = name;
        this.value = value;
        this.unit = unit;
        this.description = description;
        this.threshold = threshold;
    }
    getName() {
        return this.name;
    }
    getValue() {
        return this.value;
    }
    getUnit() {
        return this.unit;
    }
    getDescription() {
        return this.description;
    }
    getThreshold() {
        return { ...this.threshold };
    }
    isWithinThreshold() {
        if (typeof this.value !== 'number') {
            return true;
        }
        const { min, max } = this.threshold;
        if (min !== undefined && this.value < min) {
            return false;
        }
        if (max !== undefined && this.value > max) {
            return false;
        }
        return true;
    }
}
exports.CodeMetric = CodeMetric;
//# sourceMappingURL=CodeMetric.js.map