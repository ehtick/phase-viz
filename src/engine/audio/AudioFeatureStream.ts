import type { AudioAnalysis } from '../../state';
import { createAudioFrame, type AudioFrame } from './AudioFrame';

export function createAudioFeatureStream(
  analysis: AudioAnalysis,
  fps: number,
): Iterable<AudioFrame> {
  const totalFrames = Math.max(1, Math.ceil(analysis.duration * fps));
  return {
    *[Symbol.iterator]() {
      for (let frame = 0; frame < totalFrames; frame++) {
        yield createAudioFrame(analysis, frame / fps);
      }
    },
  };
}
