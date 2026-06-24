import { create } from 'zustand';

export type PresetId = 'minimal' | 'neon' | 'glitch' | 'organic';
export type MoodId = 'calm' | 'aggressive' | 'emotional' | 'dark' | 'bright';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type DisplayMode = 'visualizer3d' | 'wave' | 'imageFx';
export type WaveVisualizerType = 'horizontal' | 'circular' | 'bars';
export type WaveBackgroundMode = 'solid' | 'image';
export type ImageFxPreset = 'clean' | 'glitch' | 'dreamy' | 'dark' | 'vhs';
export type ImageFxEffectKey = 'glow' | 'blur' | 'rgbShift' | 'noise' | 'distortion' | 'pulse';
export type LiveHelpLanguage = 'en' | 'ja';
export type ParticleShape = 'circle' | 'square' | 'diamond' | 'star' | 'ring';
export type ExportPresetId = 'fast720p' | 'high1080p';
export type VisualizerLayerId = 'background' | 'particles' | 'objects' | 'waveform';
export type ImageFxLayerId =
  | 'background'
  | 'distortion'
  | 'rgbShift'
  | 'glow'
  | 'pulse'
  | 'noise'
  | 'scanlines'
  | 'vignette'
  | 'datamosh'
  | 'blockDatamosh'
  | 'glitchDatamosh'
  | 'meltDatamosh'
  | 'toggleRgb'
  | 'glitch'
  | 'cameraShake';

export const DEFAULT_IMAGE_FX_LAYER_ORDER: ImageFxLayerId[] = [
  'background',
  'distortion',
  'rgbShift',
  'glow',
  'pulse',
  'datamosh',
  'blockDatamosh',
  'glitchDatamosh',
  'meltDatamosh',
  'toggleRgb',
  'noise',
  'glitch',
  'scanlines',
  'vignette',
  'cameraShake',
];

export const DEFAULT_VISUALIZER_LAYER_ORDER: VisualizerLayerId[] = [
  'background',
  'particles',
  'objects',
  'waveform',
];

export interface ExportPreset {
  id: ExportPresetId;
  label: string;
  description: string;
  width: number;
  height: number;
  fps: number;
}

export const EXPORT_PRESETS: Record<ExportPresetId, ExportPreset> = {
  fast720p: {
    id: 'fast720p',
    label: 'Fast 720p',
    description: '1280 x 720 / 30 fps',
    width: 1280,
    height: 720,
    fps: 30,
  },
  high1080p: {
    id: 'high1080p',
    label: 'High 1080p',
    description: '1920 x 1080 / 30 fps',
    width: 1920,
    height: 1080,
    fps: 30,
  },
};

export interface AudioAnalysis {
  bpm: number;
  loudness: number;
  waveform: Float32Array;
  spectrum: Float32Array[];
  transientMap: number[];
  stereoWidth: number;
  mood: MoodId;
  energy: EnergyLevel;
  duration: number;
}

export interface EffectSettings {
  bloom: boolean;
  chromaticAberration: boolean;
  rgbSplit: boolean;
  datamosh: boolean;
  strongDatamosh: boolean;
  blockDatamosh: boolean;
  glitchDatamosh: boolean;
  meltingDatamosh: boolean;
  glitchNoise: boolean;
  cameraShake: boolean;
}

export interface ParticleSettings {
  countScale: number;
  sizeScale: number;
  shape: ParticleShape;
}

export interface VisualizerSettings {
  cameraDistance: number;
  morphIntensity: number;
}

export interface WaveVisualizerSettings {
  type: WaveVisualizerType;
  backgroundMode: WaveBackgroundMode;
}

export interface ImageFxSettings {
  preset: ImageFxPreset;
  glow: number;
  blur: number;
  rgbShift: number;
  noise: number;
  distortion: number;
  pulse: number;
}

export interface AppState {
  audioFile: File | null;
  audioBuffer: AudioBuffer | null;
  analysis: AudioAnalysis | null;
  backgroundImageUrl: string | null;
  isAnalyzing: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  displayMode: DisplayMode;
  preset: PresetId;
  presetRevision: number;
  effects: EffectSettings;
  particleSettings: ParticleSettings;
  visualizerSettings: VisualizerSettings;
  visualizerLayerOrder: VisualizerLayerId[];
  waveSettings: WaveVisualizerSettings;
  imageFxSettings: ImageFxSettings;
  imageFxLayerOrder: ImageFxLayerId[];
  isLiveMode: boolean;
  liveUiVisible: boolean;
  liveHelpOpen: boolean;
  liveHelpLanguage: LiveHelpLanguage;
  liveIntensity: number;
  liveBoost: boolean;
  exportPreset: ExportPresetId;
  isExporting: boolean;
  exportProgress: number;
  exportError: string | null;
  exportStatus: string | null;
  exportDownloadUrl: string | null;
  exportDownloadName: string;
  fps: number;
  isFullscreen: boolean;

  setAudioFile: (file: File) => void;
  setAudioBuffer: (buf: AudioBuffer) => void;
  setAnalysis: (a: AudioAnalysis) => void;
  setBackgroundImageUrl: (url: string | null) => void;
  setIsAnalyzing: (v: boolean) => void;
  setIsPlaying: (v: boolean) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setPreset: (p: PresetId) => void;
  toggleEffect: (e: keyof EffectSettings) => void;
  setParticleCountScale: (value: number) => void;
  setParticleSizeScale: (value: number) => void;
  setParticleShape: (shape: ParticleShape) => void;
  setCameraDistance: (value: number) => void;
  setMorphIntensity: (value: number) => void;
  moveVisualizerLayer: (layer: VisualizerLayerId, direction: -1 | 1) => void;
  resetVisualizerLayerOrder: () => void;
  setWaveType: (type: WaveVisualizerType) => void;
  setWaveBackgroundMode: (mode: WaveBackgroundMode) => void;
  setImageFxPreset: (preset: ImageFxPreset, values: Omit<ImageFxSettings, 'preset'>) => void;
  setImageFxEffect: (key: ImageFxEffectKey, value: number) => void;
  moveImageFxLayer: (layer: ImageFxLayerId, direction: -1 | 1) => void;
  resetImageFxLayerOrder: () => void;
  setIsLiveMode: (value: boolean) => void;
  setLiveUiVisible: (value: boolean) => void;
  setLiveHelpOpen: (value: boolean) => void;
  setLiveHelpLanguage: (language: LiveHelpLanguage) => void;
  setLiveIntensity: (value: number) => void;
  setLiveBoost: (value: boolean) => void;
  setExportPreset: (preset: ExportPresetId) => void;
  setIsExporting: (v: boolean) => void;
  setExportProgress: (p: number) => void;
  setExportError: (message: string | null) => void;
  setExportStatus: (message: string | null) => void;
  setExportDownload: (url: string | null, fileName?: string) => void;
  setFps: (f: number) => void;
  setIsFullscreen: (v: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  audioFile: null,
  audioBuffer: null,
  analysis: null,
  backgroundImageUrl: null,
  isAnalyzing: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  displayMode: 'visualizer3d',
  preset: 'neon',
  presetRevision: 0,
  effects: {
    bloom: false,
    chromaticAberration: false,
    rgbSplit: false,
    datamosh: false,
    strongDatamosh: false,
    blockDatamosh: false,
    glitchDatamosh: false,
    meltingDatamosh: false,
    glitchNoise: false,
    cameraShake: false,
  },
  particleSettings: {
    countScale: 1,
    sizeScale: 1,
    shape: 'circle',
  },
  visualizerSettings: {
    cameraDistance: 5,
    morphIntensity: 1.35,
  },
  visualizerLayerOrder: DEFAULT_VISUALIZER_LAYER_ORDER,
  waveSettings: {
    type: 'horizontal',
    backgroundMode: 'solid',
  },
  imageFxSettings: {
    preset: 'clean',
    glow: 0.28,
    blur: 0.12,
    rgbShift: 0.1,
    noise: 0.08,
    distortion: 0.08,
    pulse: 0.2,
  },
  imageFxLayerOrder: DEFAULT_IMAGE_FX_LAYER_ORDER,
  isLiveMode: false,
  liveUiVisible: true,
  liveHelpOpen: false,
  liveHelpLanguage: 'en',
  liveIntensity: 1,
  liveBoost: false,
  exportPreset: 'high1080p',
  isExporting: false,
  exportProgress: 0,
  exportError: null,
  exportStatus: null,
  exportDownloadUrl: null,
  exportDownloadName: 'audio-visualizer.mp4',
  fps: 30,
  isFullscreen: false,

  setAudioFile: (file) => set({ audioFile: file }),
  setAudioBuffer: (audioBuffer) => set({ audioBuffer }),
  setAnalysis: (analysis) => set({ analysis }),
  setBackgroundImageUrl: (backgroundImageUrl) => set({ backgroundImageUrl }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setDisplayMode: (displayMode) => set({ displayMode }),
  setPreset: (preset) => set((s) => ({ preset, presetRevision: s.presetRevision + 1 })),
  toggleEffect: (e) =>
    set((s) => ({ effects: { ...s.effects, [e]: !s.effects[e] } })),
  setParticleCountScale: (countScale) =>
    set((s) => ({ particleSettings: { ...s.particleSettings, countScale } })),
  setParticleSizeScale: (sizeScale) =>
    set((s) => ({ particleSettings: { ...s.particleSettings, sizeScale } })),
  setParticleShape: (shape) =>
    set((s) => ({ particleSettings: { ...s.particleSettings, shape } })),
  setCameraDistance: (cameraDistance) =>
    set((s) => ({ visualizerSettings: { ...s.visualizerSettings, cameraDistance } })),
  setMorphIntensity: (morphIntensity) =>
    set((s) => ({ visualizerSettings: { ...s.visualizerSettings, morphIntensity } })),
  moveVisualizerLayer: (layer, direction) =>
    set((s) => {
      const order = [...s.visualizerLayerOrder];
      const index = order.indexOf(layer);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return {};
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      return { visualizerLayerOrder: order };
    }),
  resetVisualizerLayerOrder: () => set({ visualizerLayerOrder: [...DEFAULT_VISUALIZER_LAYER_ORDER] }),
  setWaveType: (type) =>
    set((s) => ({ waveSettings: { ...s.waveSettings, type } })),
  setWaveBackgroundMode: (backgroundMode) =>
    set((s) => ({ waveSettings: { ...s.waveSettings, backgroundMode } })),
  setImageFxPreset: (preset, values) =>
    set({ imageFxSettings: { preset, ...values } }),
  setImageFxEffect: (key, value) =>
    set((s) => ({ imageFxSettings: { ...s.imageFxSettings, [key]: value } })),
  moveImageFxLayer: (layer, direction) =>
    set((s) => {
      const order = [...s.imageFxLayerOrder];
      const index = order.indexOf(layer);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return {};
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      return { imageFxLayerOrder: order };
    }),
  resetImageFxLayerOrder: () => set({ imageFxLayerOrder: [...DEFAULT_IMAGE_FX_LAYER_ORDER] }),
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
  setExportPreset: (exportPreset) => set({ exportPreset }),
  setIsExporting: (isExporting) => set({ isExporting }),
  setExportProgress: (exportProgress) => set({ exportProgress }),
  setExportError: (exportError) => set({ exportError }),
  setExportStatus: (exportStatus) => set({ exportStatus }),
  setExportDownload: (exportDownloadUrl, exportDownloadName = 'audio-visualizer.mp4') =>
    set({ exportDownloadUrl, exportDownloadName }),
  setFps: (fps) => set({ fps }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
}));
