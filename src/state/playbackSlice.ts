import type { StateCreator } from 'zustand';
import type { AppState, PlaybackSlice } from './types';

export const createPlaybackSlice: StateCreator<AppState, [], [], PlaybackSlice> = (set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  fps: 30,
  isFullscreen: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setFps: (fps) => set({ fps }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
});
