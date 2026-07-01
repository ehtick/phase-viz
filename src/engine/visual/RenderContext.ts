import type { AudioFrame } from '../audio/AudioFrame';

export type RenderContext<TConfig = unknown> = {
  config: TConfig;
  audioFrame?: AudioFrame;
  width: number;
  height: number;
  isExporting?: boolean;
  canvas?: HTMLCanvasElement;
};
