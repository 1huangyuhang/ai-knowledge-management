"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputFormattingService = exports.OutputFormat = void 0;
var OutputFormat;
(function (OutputFormat) {
    OutputFormat["JSON"] = "json";
    OutputFormat["MARKDOWN"] = "markdown";
    OutputFormat["HTML"] = "html";
    OutputFormat["PDF"] = "pdf";
    OutputFormat["CSV"] = "csv";
    OutputFormat["GRAPHML"] = "graphml";
    OutputFormat["SVG"] = "svg";
    OutputFormat["PNG"] = "png";
})(OutputFormat || (exports.OutputFormat = OutputFormat = {}));
class OutputFormattingService {
    getMimeType(format) {
        const mimeTypes = {
            [OutputFormat.JSON]: 'application/json',
            [OutputFormat.MARKDOWN]: 'text/markdown',
            [OutputFormat.HTML]: 'text/html',
            [OutputFormat.PDF]: 'application/pdf',
            [OutputFormat.CSV]: 'text/csv',
            [OutputFormat.GRAPHML]: 'application/xml',
            [OutputFormat.SVG]: 'image/svg+xml',
            [OutputFormat.PNG]: 'image/png',
        };
        return mimeTypes[format] || 'application/octet-stream';
    }
    formatModelSummary(summary, options) {
        const startTime = Date.now();
        let content;
        switch (options.format) {
            case OutputFormat.JSON:
                content = JSON.stringify(summary, null, options.indentation || 2);
                break;
            case OutputFormat.MARKDOWN:
                content = summary.summary;
                break;
            case OutputFormat.HTML:
                content = this.formatSummaryToHtml(summary, options);
                break;
            default:
                throw new Error(`Unsupported format for model summary: ${options.format}`);
        }
        const endTime = Date.now();
        const generationTime = endTime - startTime;
        return {
            id: `format-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content,
            format: options.format,
            mimeType: this.getMimeType(options.format),
            size: typeof content === 'string' ? Buffer.byteLength(content) : content.length,
            generatedAt: new Date().toISOString(),
            metadata: {
                generationTime,
                options,
            },
        };
    }
    formatSummaryToHtml(summary, options) {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${summary.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    h1, h2 {
      color: #2c3e50;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
    }
    h1 {
      font-size: 2em;
    }
    h2 {
      font-size: 1.5em;
      margin-top: 1.5em;
    }
    ul {
      list-style-type: disc;
      padding-left: 20px;
    }
    li {
      margin-bottom: 0.5em;
    }
    .stats {
      background-color: #fff;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin: 15px 0;
    }
    .top-concepts, .top-relations {
      background-color: #fff;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin: 15px 0;
    }
    .concept-item, .relation-item {
      padding: 10px;
      margin: 5px 0;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .timestamp {
      color: #666;
      font-size: 0.9em;
      margin-top: 20px;
      text-align: right;
    }
  </style>
</head>
<body>
  ${summary.summary.replace(/\n# (.*?)/g, '\n<h1>$1</h1>')
            .replace(/\n## (.*?)/g, '\n<h2>$2</h2>')
            .replace(/\n- (.*?)/g, '\n<li>$1</li>')
            .replace(/(\n<li>.*?<\/li>)+/g, '\n<ul>$&\n</ul>')}
  ${options.includeTimestamp ? `<div class="timestamp">生成时间: ${summary.generatedAt}</div>` : ''}
</body>
</html>`;
    }
    formatVisualization(visualization, options) {
        const startTime = Date.now();
        let content;
        switch (options.format) {
            case OutputFormat.JSON:
                content = JSON.stringify(visualization, null, options.indentation || 2);
                break;
            case OutputFormat.GRAPHML:
                content = `<graphml xmlns="http://graphml.graphdrawing.org/xmlns"><graph id="G" edgedefault="undirected"></graph></graphml>`;
                break;
            default:
                throw new Error(`Unsupported format for visualization: ${options.format}`);
        }
        const endTime = Date.now();
        const generationTime = endTime - startTime;
        return {
            id: `format-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content,
            format: options.format,
            mimeType: this.getMimeType(options.format),
            size: typeof content === 'string' ? Buffer.byteLength(content) : content.length,
            generatedAt: new Date().toISOString(),
            metadata: {
                generationTime,
                options,
            },
        };
    }
    formatModel(model, options) {
        const startTime = Date.now();
        let content;
        switch (options.format) {
            case OutputFormat.JSON:
                content = JSON.stringify({
                    id: model.id,
                    concepts: model.concepts,
                    relations: model.relations,
                    createdAt: model.createdAt.toISOString(),
                    updatedAt: model.updatedAt.toISOString(),
                    metadata: model.metadata,
                }, null, options.indentation || 2);
                break;
            case OutputFormat.CSV:
                content = this.formatModelToCsv(model, options);
                break;
            default:
                throw new Error(`Unsupported format for model: ${options.format}`);
        }
        const endTime = Date.now();
        const generationTime = endTime - startTime;
        return {
            id: `format-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content,
            format: options.format,
            mimeType: this.getMimeType(options.format),
            size: typeof content === 'string' ? Buffer.byteLength(content) : content.length,
            generatedAt: new Date().toISOString(),
            metadata: {
                generationTime,
                options,
            },
        };
    }
    formatModelToCsv(model, options) {
        let csvContent = '';
        csvContent += 'Concepts:\n';
        csvContent += 'ID,Name,Confidence,OccurrenceCount,Centrality,CreatedAt,LastOccurrence\n';
        model.concepts.forEach(concept => {
            csvContent += `${concept.id},"${concept.name}",${concept.confidence},${concept.occurrenceCount},${concept.metadata.centrality || 0},${concept.createdAt.toISOString()},${concept.lastOccurrence.toISOString()}\n`;
        });
        csvContent += '\nRelations:\n';
        csvContent += 'ID,Source,Target,Type,Confidence,Strength,OccurrenceCount,CreatedAt,LastOccurrence\n';
        model.relations.forEach(relation => {
            const sourceConcept = model.concepts.find(c => c.id === relation.sourceConceptId);
            const targetConcept = model.concepts.find(c => c.id === relation.targetConceptId);
            csvContent += `${relation.id},"${sourceConcept?.name || relation.sourceConceptId}","${targetConcept?.name || relation.targetConceptId}",${relation.type},${relation.confidence},${relation.strength},${relation.occurrenceCount},${relation.createdAt.toISOString()},${relation.lastOccurrence.toISOString()}\n`;
        });
        return csvContent;
    }
}
exports.OutputFormattingService = OutputFormattingService;
//# sourceMappingURL=OutputFormattingService.js.map