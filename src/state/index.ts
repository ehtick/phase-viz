import { create } from 'zustand';
import { createAudioSlice } from './audioSlice';
import { createExportSlice } from './exportSlice';
import { createLiveSlice } from './liveSlice';
import { createPlaybackSlice } from './playbackSlice';
import { createProjectSlice } from './projectSlice';
import { createVisualSlice } from './visualSlice';
import type { AppState } from './types';

export const useStore = create<AppState>()((...args) => ({
  ...createAudioSlice(...args),
  ...createPlaybackSlice(...args),
  ...createVisualSlice(...args),
  ...createLiveSlice(...args),
  ...createExportSlice(...args),
  ...createProjectSlice(...args),
}));

export * from './types';
