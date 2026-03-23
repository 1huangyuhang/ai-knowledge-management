"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowFactory = void 0;
const workflow_impl_1 = require("./workflow.impl");
const ingest_thought_step_1 = require("./steps/ingest-thought.step");
const generate_proposal_step_1 = require("./steps/generate-proposal.step");
const update_cognitive_model_step_1 = require("./steps/update-cognitive-model.step");
class WorkflowFactory {
    ingestThoughtUseCase;
    generateProposalUseCase;
    updateCognitiveModelUseCase;
    constructor(ingestThoughtUseCase, generateProposalUseCase, updateCognitiveModelUseCase) {
        this.ingestThoughtUseCase = ingestThoughtUseCase;
        this.generateProposalUseCase = generateProposalUseCase;
        this.updateCognitiveModelUseCase = updateCognitiveModelUseCase;
    }
    createCognitiveProcessingWorkflow() {
        const workflow = new workflow_impl_1.WorkflowImpl('CognitiveProcessingWorkflow');
        workflow.addStep(new ingest_thought_step_1.IngestThoughtStep(this.ingestThoughtUseCase));
        workflow.addStep(new generate_proposal_step_1.GenerateProposalStep(this.generateProposalUseCase));
        workflow.addStep(new update_cognitive_model_step_1.UpdateCognitiveModelStep(this.updateCognitiveModelUseCase));
        return workflow;
    }
}
exports.WorkflowFactory = WorkflowFactory;
//# sourceMappingURL=workflow-factory.js.map