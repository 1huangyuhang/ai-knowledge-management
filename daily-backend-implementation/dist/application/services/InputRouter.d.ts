import { UnifiedInput } from '../adapters/InputAdapter';
export interface RouteDestination {
    flow: string;
    service: string;
    queue: string;
    priority: number;
}
export declare class InputRouter {
    routeInput(input: UnifiedInput): RouteDestination;
    determineProcessingFlow(input: UnifiedInput): string;
    private determineFileProcessingFlow;
    private determineTextProcessingFlow;
    private getRouteDestination;
}
//# sourceMappingURL=InputRouter.d.ts.map