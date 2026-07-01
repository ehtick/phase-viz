import type { StateCreator } from 'zustand';
import type { AppState, AudioSlice } from './types';

export const createAudioSlice: StateCreator<AppState, [], [], AudioSlice> = (set) => ({
  audioFile: null,
  audioBuffer: null,
  analysis: null,
  backgroundImageUrl: null,
  isAnalyzing: false,
  setAudioFile: (file) => set({ audioFile: file }),
  setAudioBuffer: (audioBuffer) => set({ audioBuffer }),
  setAnalysis: (analysis) => set({ analysis }),
  setBackgroundImageUrl: (backgroundImageUrl) => set({ backgroundImageUrl }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
});
