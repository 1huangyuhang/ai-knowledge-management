"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalContainer = exports.SimpleDependencyContainer = void 0;
class SimpleDependencyContainer {
    dependencies = new Map();
    singletonInstances = new Map();
    register(key, factory) {
        this.dependencies.set(key, factory);
    }
    registerSingleton(key, factory) {
        this.dependencies.set(key, factory);
    }
    resolve(key) {
        if (!this.dependencies.has(key)) {
            throw new Error(`Dependency not found: ${key}`);
        }
        if (this.singletonInstances.has(key)) {
            return this.singletonInstances.get(key);
        }
        const factory = this.dependencies.get(key);
        const instance = factory();
        this.singletonInstances.set(key, instance);
        return instance;
    }
    has(key) {
        return this.dependencies.has(key);
    }
    clear() {
        this.dependencies.clear();
        this.singletonInstances.clear();
    }
}
exports.SimpleDependencyContainer = SimpleDependencyContainer;
exports.globalContainer = new SimpleDependencyContainer();
//# sourceMappingURL=DependencyContainer.js.map