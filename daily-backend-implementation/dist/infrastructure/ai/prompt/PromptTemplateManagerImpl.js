"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplateManagerImpl = void 0;
const PromptTemplateImpl_1 = require("./PromptTemplateImpl");
class PromptTemplateManagerImpl {
    templates = new Map();
    logger;
    constructor(logger) {
        this.logger = logger;
        this.registerDefaultTemplates();
    }
    registerTemplate(template) {
        const promptTemplate = new PromptTemplateImpl_1.PromptTemplateImpl(template);
        this.templates.set(template.name, promptTemplate);
        this.logger.info('Prompt template registered', { templateName: template.name });
    }
    getTemplate(name) {
        return this.templates.get(name);
    }
    generatePrompt(options) {
        if (options.customTemplate) {
            const customTemplate = new PromptTemplateImpl_1.PromptTemplateImpl({
                name: 'custom',
                template: options.customTemplate,
                description: 'Custom template',
            });
            return customTemplate.generatePrompt(options.params || {});
        }
        const templateName = options.templateName || 'default';
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Prompt template not found: ${templateName}`);
        }
        if (!template.validateParams(options.params || {})) {
            throw new Error(`Invalid parameters for template: ${templateName}`);
        }
        const prompt = template.generatePrompt(options.params || {});
        this.logger.info('Prompt generated', {
            templateName,
            promptLength: prompt.length,
        });
        return prompt;
    }
    getAllTemplates() {
        return this.templates;
    }
    removeTemplate(name) {
        this.templates.delete(name);
        this.logger.info('Prompt template removed', { templateName: name });
    }
    updateTemplate(template) {
        this.registerTemplate(template);
    }
    registerDefaultTemplates() {
        this.registerTemplate({
            name: 'default',
            template: '请根据以下内容生成响应：\n\n{{content}}',
            description: '默认模板',
            parameters: ['content'],
        });
        this.registerTemplate({
            name: 'thought-parser',
            template: `你是一个思维片段解析专家，请从以下文本中提取关键概念和它们之间的关系：\n\n{{text}}\n\n请以JSON格式输出，包含以下字段：\n- concepts: 概念列表，每个概念包含name、description和type\n- relations: 关系列表，每个关系包含source、target和type\n- summary: 文本摘要\n\n请确保输出格式正确，不要包含任何额外内容。`,
            description: '思维片段解析模板',
            parameters: ['text'],
        });
        this.registerTemplate({
            name: 'relation-inference',
            template: `你是一个概念关系推断专家，请根据以下概念列表推断它们之间的潜在关系：\n\n概念列表：\n{{concepts}}\n\n请以JSON格式输出，包含以下字段：\n- relations: 关系列表，每个关系包含source、target、type和confidence\n\n请确保输出格式正确，不要包含任何额外内容。`,
            description: '概念关系推断模板',
            parameters: ['concepts'],
        });
        this.registerTemplate({
            name: 'model-summary',
            template: `你是一个认知模型分析专家，请根据以下认知模型数据生成一个简洁的摘要：\n\n认知模型数据：\n{{modelData}}\n\n请从以下几个方面生成摘要：\n1. 核心概念\n2. 主要关系\n3. 认知结构特点\n4. 潜在的认知盲区\n\n请确保摘要简洁明了，不要超过500字。`,
            description: '认知模型摘要模板',
            parameters: ['modelData'],
        });
        this.registerTemplate({
            name: 'theme-analysis',
            template: `你是一个主题分析专家，请从以下文本中提取核心主题：\n\n文本：\n{{text}}\n\n请以JSON格式输出，包含以下字段：\n- themes: 主题列表，每个主题包含name、weight和relatedConcepts\n- summary: 主题分析摘要\n\n请确保输出格式正确，不要包含任何额外内容。`,
            description: '主题分析模板',
            parameters: ['text'],
        });
    }
}
exports.PromptTemplateManagerImpl = PromptTemplateManagerImpl;
//# sourceMappingURL=PromptTemplateManagerImpl.js.map