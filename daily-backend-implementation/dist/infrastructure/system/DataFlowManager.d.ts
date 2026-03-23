export interface DataTransformer<T, U> {
    transform(data: T): Promise<U>;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    timestamp: string;
}
export interface DataValidator<T> {
    validate(data: T): Promise<ValidationResult>;
}
export interface DataFlowManager {
    registerDataTransformer<T, U>(sourceModule: string, targetModule: string, transformer: DataTransformer<T, U>): Promise<void>;
    transformData<T, U>(sourceModule: string, targetModule: string, data: T): Promise<U>;
    registerDataValidator<T>(moduleId: string, validator: DataValidator<T>): Promise<void>;
    validateData<T>(moduleId: string, data: T): Promise<ValidationResult>;
    removeDataTransformer(sourceModule: string, targetModule: string): Promise<void>;
    removeDataValidator(moduleId: string): Promise<void>;
}
export declare class DefaultDataFlowManager implements DataFlowManager {
    private transformers;
    private validators;
    registerDataTransformer<T, U>(sourceModule: string, targetModule: string, transformer: DataTransformer<T, U>): Promise<void>;
    transformData<T, U>(sourceModule: string, targetModule: string, data: T): Promise<U>;
    registerDataValidator<T>(moduleId: string, validator: DataValidator<T>): Promise<void>;
    validateData<T>(moduleId: string, data: T): Promise<ValidationResult>;
    removeDataTransformer(sourceModule: string, targetModule: string): Promise<void>;
    removeDataValidator(moduleId: string): Promise<void>;
}
export declare const dataFlowManager: DefaultDataFlowManager;
//# sourceMappingURL=DataFlowManager.d.ts.map