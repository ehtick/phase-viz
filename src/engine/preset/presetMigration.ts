import {
  PHASE_VIZ_PRESET_SCHEMA_VERSION,
  isPhaseVizPreset,
  type PhaseVizPreset,
} from './PresetSchema';

export function migratePreset(input: unknown): PhaseVizPreset {
  if (!isPhaseVizPreset(input)) {
    throw new Error('Invalid phase-viz preset');
  }

  if (input.schemaVersion > PHASE_VIZ_PRESET_SCHEMA_VERSION) {
    throw new Error(`Unsupported phase-viz preset version: ${input.schemaVersion}`);
  }

  return {
    ...input,
    schemaVersion: PHASE_VIZ_PRESET_SCHEMA_VERSION,
  };
}
