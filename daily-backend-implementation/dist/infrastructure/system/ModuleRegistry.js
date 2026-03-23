"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleRegistry = exports.InMemoryModuleRegistry = exports.ModuleStatus = void 0;
var ModuleStatus;
(function (ModuleStatus) {
    ModuleStatus["INITIALIZING"] = "INITIALIZING";
    ModuleStatus["RUNNING"] = "RUNNING";
    ModuleStatus["STOPPED"] = "STOPPED";
    ModuleStatus["ERROR"] = "ERROR";
})(ModuleStatus || (exports.ModuleStatus = ModuleStatus = {}));
class InMemoryModuleRegistry {
    modules = new Map();
    async registerModule(module) {
        for (const dep of module.dependencies) {
            if (!this.modules.has(dep)) {
                throw new Error(`Dependency ${dep} not found for module ${module.id}`);
            }
        }
        this.modules.set(module.id, { ...module, status: ModuleStatus.INITIALIZING });
        return true;
    }
    async unregisterModule(moduleId) {
        for (const [id, module] of this.modules.entries()) {
            if (id !== moduleId && module.dependencies.includes(moduleId)) {
                throw new Error(`Module ${moduleId} is still referenced by module ${id}`);
            }
        }
        return this.modules.delete(moduleId);
    }
    async getModule(moduleId) {
        return this.modules.get(moduleId) || null;
    }
    async getAllModules() {
        return Array.from(this.modules.values());
    }
    async isModuleAvailable(moduleId) {
        const module = this.modules.get(moduleId);
        return !!module && module.status === ModuleStatus.RUNNING;
    }
    async updateModuleStatus(moduleId, status) {
        const module = this.modules.get(moduleId);
        if (!module) {
            return false;
        }
        this.modules.set(moduleId, { ...module, status });
        return true;
    }
}
exports.InMemoryModuleRegistry = InMemoryModuleRegistry;
exports.moduleRegistry = new InMemoryModuleRegistry();
//# sourceMappingURL=ModuleRegistry.js.map