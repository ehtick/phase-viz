import type { StateCreator } from 'zustand';
import type { AppState, LiveSlice } from './types';

export const createLiveSlice: StateCreator<AppState, [], [], LiveSlice> = (set) => ({
  isLiveMode: false,
  liveUiVisible: true,
  liveHelpOpen: false,
  liveHelpLanguage: 'en',
  liveIntensity: 1,
  liveBoost: false,
  setIsLiveMode: (isLiveMode) =>
    set({
      isLiveMode,
      liveUiVisible: true,
      liveHelpOpen: isLiveMode,
      liveBoost: false,
    }),
  setLiveUiVisible: (liveUiVisible) => set({ liveUiVisible }),
  setLiveHelpOpen: (liveHelpOpen) => set({ liveHelpOpen }),
  setLiveHelpLanguage: (liveHelpLanguage) => set({ liveHelpLanguage }),
  setLiveIntensity: (liveIntensity) => set({ liveIntensity }),
  setLiveBoost: (liveBoost) => set({ liveBoost }),
});
