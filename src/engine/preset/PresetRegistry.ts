import { migratePreset } from './presetMigration';
import type { PhaseVizPreset } from './PresetSchema';

export class PresetRegistry {
  private presets = new Map<string, PhaseVizPreset>();

  constructor(initialPresets: PhaseVizPreset[] = []) {
    initialPresets.forEach((preset) => this.register(preset));
  }

  register(input: PhaseVizPreset | unknown) {
    const preset = migratePreset(input);
    this.presets.set(preset.id, preset);
    return preset;
  }

  get(id: string) {
    return this.presets.get(id);
  }

  list() {
    return Array.from(this.presets.values());
  }

  toJSON() {
    return this.list();
  }
}
