import type { AudioAnalysis } from '../../state';

export type AudioFrame = {
  time: number;
  progress: number;
  volume: number;
  low: number;
  mid: number;
  high: number;
  transient: number;
  beat: number;
  stereoWidth?: number;
  waveform?: Float32Array;
  spectrum?: Float32Array;
};

export function createAudioFrame(analysis: AudioAnalysis, time: number): AudioFrame {
  const duration = Math.max(analysis.duration, 0.001);
  const progress = clamp01(time / duration);
  const spectrumIndex = Math.min(
    analysis.spectrum.length - 1,
    Math.max(0, Math.floor(progress * analysis.spectrum.length)),
  );
  const spectrum = analysis.spectrum[spectrumIndex] ?? new Float32Array();
  const transient = analysis.transientMap[spectrumIndex] ?? 0;

  return {
    time,
    progress,
    volume: normalizeLoudness(analysis.loudness),
    low: averageBand(spectrum, 0, 0.18),
    mid: averageBand(spectrum, 0.18, 0.55),
    high: averageBand(spectrum, 0.55, 1),
    transient,
    beat: transient > 0.72 ? 1 : 0,
    stereoWidth: analysis.stereoWidth,
    waveform: analysis.waveform,
    spectrum,
  };
}

function averageBand(values: Float32Array, startRatio: number, endRatio: number) {
  if (values.length === 0) return 0;
  const start = Math.floor(values.length * startRatio);
  const end = Math.max(start + 1, Math.floor(values.length * endRatio));
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += values[i] ?? 0;
  }
  return clamp01(sum / (end - start));
}

function normalizeLoudness(loudness: number) {
  return clamp01((loudness + 60) / 60);
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}
