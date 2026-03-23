import { FastifyReply, FastifyRequest } from 'fastify';
import { InputAdapter } from '../../application/adapters/InputAdapter';
import { InputMerger } from '../../application/services/InputMerger';
import { InputPrioritizer } from '../../application/services/InputPrioritizer';
import { InputRouter } from '../../application/services/InputRouter';
import { InputRepository } from '../../domain/repositories/input-repository';
import { AITaskRepository } from '../../domain/repositories/ai-task-repository';
export declare class InputIntegrationController {
    private readonly inputAdapter;
    private readonly inputMerger;
    private readonly inputPrioritizer;
    private readonly inputRouter;
    private readonly inputRepository;
    private readonly aiTaskRepository;
    constructor(inputAdapter: InputAdapter, inputMerger: InputMerger, inputPrioritizer: InputPrioritizer, inputRouter: InputRouter, inputRepository: InputRepository, aiTaskRepository: AITaskRepository);
    integrateInput(req: FastifyRequest, res: FastifyReply): Promise<void>;
    getInputHistory(req: FastifyRequest, res: FastifyReply): Promise<void>;
    getInputStatistics(req: FastifyRequest, res: FastifyReply): Promise<void>;
    mergeInputs(req: FastifyRequest, res: FastifyReply): Promise<void>;
}
//# sourceMappingURL=input-integration.controller.d.ts.map