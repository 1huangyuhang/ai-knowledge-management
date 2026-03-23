import { UUID } from '../value-objects/UUID';
import { SuggestionType } from '../enums/SuggestionType';
import { SuggestionCategory } from '../enums/SuggestionCategory';
declare abstract class Entity {
    protected _id: UUID;
    constructor(_id: UUID);
    get id(): UUID;
}
export declare class Suggestion extends Entity {
    private _type;
    private _content;
    private _description;
    private _priority;
    private _confidence;
    private _relatedConcepts;
    private _actionItems;
    private _category;
    private _metadata;
    private _userId;
    private _cognitiveModelId;
    private _context?;
    constructor(id: UUID, type: SuggestionType, content: string, description: string, priority: number, confidence: number, relatedConcepts: string[], actionItems: string[], category: SuggestionCategory, userId: string, cognitiveModelId: string, context?: string, metadata?: Record<string, any>);
    get type(): SuggestionType;
    get content(): string;
    get description(): string;
    get priority(): number;
    get confidence(): number;
    get relatedConcepts(): string[];
    get actionItems(): string[];
    get category(): SuggestionCategory;
    get metadata(): Record<string, any>;
    get userId(): string;
    get cognitiveModelId(): string;
    get context(): string | undefined;
    setPriority(priority: number): void;
    setConfidence(confidence: number): void;
    addRelatedConcept(concept: string): void;
    addActionItem(actionItem: string): void;
    updateMetadata(key: string, value: any): void;
}
export {};
//# sourceMappingURL=Suggestion.d.ts.map