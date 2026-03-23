import { FastifyReply, FastifyRequest } from 'fastify';
import { InputAdapter } from '../../application/adapters/InputAdapter';
import { InputMerger } from '../../application/services/InputMerger';
import { InputRouter } from '../../application/services/InputRouter';
import { InputPrioritizer } from '../../application/services/InputPrioritizer';
import { AITaskRepository } from '../../domain/repositories/AITaskRepository';
export declare class InputIntegrationController {
    private inputAdapter;
    private inputPrioritizer;
    private inputMerger;
    private inputRouter;
    private aiTaskRepository;
    constructor(inputAdapter: InputAdapter, inputPrioritizer: InputPrioritizer, inputMerger: InputMerger, inputRouter: InputRouter, aiTaskRepository: AITaskRepository);
    integrateInput(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    getInputHistory(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    getInputStatistics(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=InputIntegrationController.d.ts.map