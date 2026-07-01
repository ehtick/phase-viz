import type { StateCreator } from 'zustand';
import type { AppState, ProjectSlice } from './types';

export const createProjectSlice: StateCreator<AppState, [], [], ProjectSlice> = (set) => ({
  projectName: 'Untitled phase-viz project',
  setProjectName: (projectName) => set({ projectName }),
});
