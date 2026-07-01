import Paper from '@mui/material/Paper';
import Controls from '../ui/Controls';

interface RightPanelProps {
  onExport: () => void;
  onCancelExport: () => void;
}

export default function RightPanel({ onExport, onCancelExport }: RightPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: 220,
        flexShrink: 0,
        p: 1.5,
        borderRadius: 0,
        borderLeft: '1px solid',
        borderColor: 'divider',
        overflow: 'auto',
      }}
    >
      <Controls onExport={onExport} onCancelExport={onCancelExport} />
    </Paper>
  );
}
