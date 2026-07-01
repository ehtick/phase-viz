import type { AudioAnalysis } from '../../state';
import { createAudioFrame } from './AudioFrame';

export function sampleRealtimeFrame(analysis: AudioAnalysis, currentTime: number) {
  return createAudioFrame(analysis, currentTime);
}
