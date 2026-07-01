import type { StateCreator } from 'zustand';
import type { AppState, ExportSlice } from './types';

export const createExportSlice: StateCreator<AppState, [], [], ExportSlice> = (set) => ({
  exportPreset: 'high1080p',
  isExporting: false,
  exportProgress: 0,
  exportError: null,
  exportStatus: null,
  exportDownloadUrl: null,
  exportDownloadName: 'audio-visualizer.mp4',
  setExportPreset: (exportPreset) => set({ exportPreset }),
  setIsExporting: (isExporting) => set({ isExporting }),
  setExportProgress: (exportProgress) => set({ exportProgress }),
  setExportError: (exportError) => set({ exportError }),
  setExportStatus: (exportStatus) => set({ exportStatus }),
  setExportDownload: (exportDownloadUrl, exportDownloadName = 'audio-visualizer.mp4') =>
    set({ exportDownloadUrl, exportDownloadName }),
});
