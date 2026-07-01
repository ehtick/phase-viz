import type { AudioAnalysis } from '../../state';
import { analyzeAudio } from '../../audio/analyze';
import { createAudioFrame } from './AudioFrame';

export class AudioEngine {
  analyze(buffer: AudioBuffer): Promise<AudioAnalysis> {
    return analyzeAudio(buffer);
  }

  frameAt(analysis: AudioAnalysis, time: number) {
    return createAudioFrame(analysis, time);
  }
}
