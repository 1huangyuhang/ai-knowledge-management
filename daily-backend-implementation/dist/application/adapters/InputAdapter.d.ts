import { FileInput } from '../../domain/entities/file-input';
import { SpeechInput } from '../../domain/entities/speech-input';
import { ThoughtFragment } from '../../domain/entities/thought-fragment';
export interface UnifiedInput {
    id: string;
    type: 'file' | 'speech' | 'text';
    content: string;
    metadata: Record<string, any>;
    source: string;
    createdAt: Date;
    priority?: number;
}
export declare class InputAdapter {
    adaptFileInput(fileInput: FileInput): UnifiedInput;
    adaptSpeechInput(speechInput: SpeechInput): UnifiedInput;
    adaptTextInput(textInput: ThoughtFragment): UnifiedInput;
    normalizeInput(input: any): UnifiedInput;
}
//# sourceMappingURL=InputAdapter.d.ts.map