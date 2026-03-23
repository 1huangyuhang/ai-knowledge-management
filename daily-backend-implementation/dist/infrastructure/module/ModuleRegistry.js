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
                throw new Error(`依赖模块 '${dep}' 未注册，无法注册模块 '${module.id}'`);
            }
            const depModule = this.modules.get(dep);
            if (depModule.status === ModuleStatus.ERROR) {
                throw new Error(`依赖模块 '${dep}' 处于错误状态，无法注册模块 '${module.id}'`);
            }
        }
        this.modules.set(module.id, { ...module, status: ModuleStatus.INITIALIZING });
        return true;
    }
    async unregisterModule(moduleId) {
        if (!this.modules.has(moduleId)) {
            return false;
        }
        for (const [id, module] of this.modules.entries()) {
            if (id !== moduleId && module.dependencies.includes(moduleId)) {
                throw new Error(`模块 '${moduleId}' 被模块 '${id}' 依赖，无法注销`);
            }
        }
        this.modules.delete(moduleId);
        return true;
    }
    async getModule(moduleId) {
        return this.modules.get(moduleId) || null;
    }
    async getAllModules() {
        return Array.from(this.modules.values());
    }
    async isModuleAvailable(moduleId) {
        const module = this.modules.get(moduleId);
        return module !== undefined && module.status === ModuleStatus.RUNNING;
    }
    async updateModuleStatus(moduleId, status) {
        if (!this.modules.has(moduleId)) {
            return false;
        }
        const module = this.modules.get(moduleId);
        this.modules.set(moduleId, { ...module, status });
        return true;
    }
    async validateModuleDependencies(moduleId) {
        const module = this.modules.get(moduleId);
        if (!module) {
            return false;
        }
        for (const dep of module.dependencies) {
            if (!this.modules.has(dep)) {
                return false;
            }
            const depModule = this.modules.get(dep);
            if (depModule.status !== ModuleStatus.RUNNING) {
                return false;
            }
        }
        return true;
    }
}
exports.InMemoryModuleRegistry = InMemoryModuleRegistry;
exports.moduleRegistry = new InMemoryModuleRegistry();
//# sourceMappingURL=ModuleRegistry.js.map