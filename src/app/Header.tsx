import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        gap: 1.5,
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      <GraphicEqIcon sx={{ color: 'primary.main', fontSize: 20 }} />
      <Typography
        variant="h6"
        sx={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'primary.light',
          flex: 1,
        }}
      >
        Audio Reactive 3D Visualizer
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
        Three.js - Web Audio API - WebGL
      </Typography>
    </Box>
  );
}
