export const PHASE_VIZ_PRESET_SCHEMA_VERSION = 1;

export type PhaseVizPreset = {
  schemaVersion: number;
  id: string;
  name: string;
  author?: string;
  description?: string;
  mode: string;
  visual: Record<string, unknown>;
  audioMapping?: Record<string, unknown>;
  effects?: Record<string, unknown>;
  export?: Record<string, unknown>;
};

export function isPhaseVizPreset(value: unknown): value is PhaseVizPreset {
  if (!value || typeof value !== 'object') return false;
  const preset = value as Partial<PhaseVizPreset>;
  return typeof preset.schemaVersion === 'number'
    && typeof preset.id === 'string'
    && typeof preset.name === 'string'
    && typeof preset.mode === 'string'
    && Boolean(preset.visual)
    && typeof preset.visual === 'object';
}
