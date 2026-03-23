"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveRelationType = void 0;
class CognitiveRelationType {
    value;
    constructor(value) {
        if (!this.isValidRelationType(value)) {
            throw new Error('Invalid cognitive relation type');
        }
        this.value = value;
    }
    getValue() {
        return this.value;
    }
    isValidRelationType(type) {
        const validTypes = [
            'sub_concept',
            'super_concept',
            'associated_with',
            'causes',
            'composed_of',
            'equivalent_to',
            'contrast_with',
            'implements',
            'instance_of',
            'influences'
        ];
        return validTypes.includes(type);
    }
    equals(other) {
        return this.value === other.getValue();
    }
    getReadableName() {
        const nameMap = {
            'sub_concept': '子概念',
            'super_concept': '父概念',
            'associated_with': '关联',
            'causes': '导致',
            'composed_of': '组成',
            'equivalent_to': '等价',
            'contrast_with': '对比',
            'implements': '实现',
            'instance_of': '实例',
            'influences': '影响'
        };
        return nameMap[this.value] || this.value;
    }
}
exports.CognitiveRelationType = CognitiveRelationType;
//# sourceMappingURL=cognitive-relation-type.js.map