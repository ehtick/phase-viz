import type { VisualModeDefinition } from './VisualMode';

export class VisualModeRegistry {
  private modes = new Map<string, VisualModeDefinition>();

  register<TConfig>(mode: VisualModeDefinition<TConfig>) {
    if (this.modes.has(mode.id)) {
      throw new Error(`Visual mode "${mode.id}" is already registered`);
    }
    this.modes.set(mode.id, mode as VisualModeDefinition);
    return mode;
  }

  get(id: string) {
    return this.modes.get(id);
  }

  list() {
    return Array.from(this.modes.values());
  }
}

export const visualModeRegistry = new VisualModeRegistry();

export function registerVisualMode<TConfig>(mode: VisualModeDefinition<TConfig>) {
  return visualModeRegistry.register(mode);
}
