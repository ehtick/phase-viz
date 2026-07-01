import type { RenderContext } from './RenderContext';
import type { ReactNode } from 'react';

export type VisualModeDefinition<TConfig = unknown> = {
  id: string;
  name: string;
  description?: string;
  defaultConfig: TConfig;
  render: (context: RenderContext<TConfig>) => ReactNode;
};
