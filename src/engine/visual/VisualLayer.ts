import type { RenderContext } from './RenderContext';
import type { ReactNode } from 'react';

export type VisualLayerDefinition<TConfig = unknown> = {
  id: string;
  name: string;
  render: (context: RenderContext<TConfig>) => ReactNode;
};
