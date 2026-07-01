import Box from '@mui/material/Box';
import type { VisualModeDefinition } from '../../engine/visual/VisualMode';

export type ExampleMinimalConfig = {
  color: string;
  background: string;
};

export const exampleMinimalMode: VisualModeDefinition<ExampleMinimalConfig> = {
  id: 'example-minimal',
  name: 'Example Minimal',
  description: 'A tiny contributor-facing visual mode that reacts to normalized AudioFrame values.',
  defaultConfig: {
    color: '#00e5ee',
    background: '#050508',
  },
  render: ({ audioFrame, config }) => {
    const scale = 0.35 + (audioFrame?.volume ?? 0) * 0.65 + (audioFrame?.transient ?? 0) * 0.25;
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: config.background,
        }}
      >
        <Box
          sx={{
            width: 220,
            height: 220,
            borderRadius: '50%',
            bgcolor: config.color,
            opacity: 0.82,
            transform: `scale(${scale})`,
            transition: 'transform 80ms linear',
            boxShadow: `0 0 64px ${config.color}`,
          }}
        />
      </Box>
    );
  },
};
