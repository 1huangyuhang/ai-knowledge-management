"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplateImpl = void 0;
class PromptTemplateImpl {
    config;
    constructor(config) {
        this.config = {
            version: '1.0.0',
            type: 'default',
            parameters: [],
            defaultParams: {},
            ...config,
        };
        this.extractParameters();
    }
    getName() {
        return this.config.name;
    }
    getDescription() {
        return this.config.description || '';
    }
    getParameters() {
        return this.config.parameters || [];
    }
    generatePrompt(params) {
        let prompt = this.config.template;
        const mergedParams = {
            ...this.config.defaultParams,
            ...params,
        };
        for (const param of this.config.parameters) {
            const regex = new RegExp(`{{${param}}}`, 'g');
            const value = mergedParams[param] !== undefined ? String(mergedParams[param]) : 'undefined';
            prompt = prompt.replace(regex, value);
        }
        return prompt;
    }
    getTemplate() {
        return this.config.template;
    }
    validateParams(params) {
        for (const param of this.config.parameters || []) {
            if (!(param in params) && !(param in this.config.defaultParams)) {
                return false;
            }
        }
        return true;
    }
    extractParameters() {
        const params = [];
        const regex = /{{(\w+)}}/g;
        let match;
        while ((match = regex.exec(this.config.template)) !== null) {
            if (!params.includes(match[1])) {
                params.push(match[1]);
            }
        }
        this.config.parameters = params;
    }
}
exports.PromptTemplateImpl = PromptTemplateImpl;
//# sourceMappingURL=PromptTemplateImpl.js.map