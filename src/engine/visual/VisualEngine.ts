import { visualModeRegistry, type VisualModeRegistry } from './registerVisualMode';

export class VisualEngine {
  private registry: VisualModeRegistry;

  constructor(registry: VisualModeRegistry = visualModeRegistry) {
    this.registry = registry;
  }

  modes() {
    return this.registry.list();
  }

  mode(id: string) {
    return this.registry.get(id);
  }
}
