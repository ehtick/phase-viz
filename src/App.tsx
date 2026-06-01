import { useCallback, useEffect, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import theme from './theme';
import { useStore } from './store';
import type { ImageFxPreset, PresetId, WaveVisualizerType } from './store';
import Uploader from './ui/Uploader';
import Controls from './ui/Controls';
import React, { Suspense } from 'react';
const VisualizerCanvas = React.lazy(() => import('./ui/VisualizerCanvas'));
const WaveVisualizer = React.lazy(() => import('./ui/WaveVisualizer'));
const ImageFXVisualizer = React.lazy(() => import('./ui/ImageFXVisualizer'));
import LiveVJHelp from './ui/LiveVJHelp';
import Timeline from './ui/Timeline';
import type { ExportFrameRenderer, FrameRecorder } from './export/recorder';
import { DEFAULT_EXPORT_FILE_NAME, triggerBlobDownload } from './export/download';
import { PRESETS } from './visual/presets';
import { IMAGE_FX_PRESETS } from './visual/imageFxPresets';

const PRESET_IDS = Object.keys(PRESETS) as PresetId[];
const WAVE_TYPES: WaveVisualizerType[] = ['horizontal', 'circular', 'bars'];
const IMAGE_FX_PRESET_IDS: ImageFxPreset[] = ['clean', 'glitch', 'dreamy', 'dark', 'vhs'];
const LIVE_INTENSITY_STEP = 0.1;
const LIVE_INTENSITY_MIN = 0.5;
const LIVE_INTENSITY_MAX = 1.8;

export default function App() {
  const recorderRef = useRef<FrameRecorder | null>(null);
  const exportRendererRef = useRef<ExportFrameRenderer | null>(null);
  const exportAbortRef = useRef<AbortController | null>(null);
  const lastExportUrlRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    audioBuffer,
    analysis,
    displayMode,
    isExporting,
    isFullscreen,
    isLiveMode,
    liveUiVisible,
    liveHelpOpen,
    liveHelpLanguage,
    liveIntensity,
    liveBoost,
    setIsFullscreen,
    setIsExporting,
    setExportProgress,
    setExportError,
    setExportStatus,
    setExportDownload,
    setIsLiveMode,
    setLiveUiVisible,
    setLiveHelpOpen,
    setLiveHelpLanguage,
  } = useStore();
  const showChrome = !isLiveMode || liveUiVisible;

  useEffect(() => () => {
    if (lastExportUrlRef.current) {
      URL.revokeObjectURL(lastExportUrlRef.current);
    }
  }, []);

  const handleExport = async () => {
    if (isExporting || !audioBuffer || !analysis || !exportRendererRef.current) return;

    const abortController = new AbortController();
    exportAbortRef.current = abortController;
    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);
    setExportStatus('Preparing export...');
    if (lastExportUrlRef.current) {
      URL.revokeObjectURL(lastExportUrlRef.current);
      lastExportUrlRef.current = null;
    }
    setExportDownload(null);

    const fps = 30;
    let lastProgress = 0;
    let lastProgressAt = 0;
    const reportProgress = (progress: number) => {
      const now = performance.now();
      if (progress <= 0 || progress >= 1 || progress - lastProgress >= 0.01 || now - lastProgressAt >= 120) {
        lastProgress = progress;
        lastProgressAt = now;
        setExportProgress(progress);
      }
    };

    try {
      const blob = await exportRendererRef.current({
        duration: analysis.duration,
        fps,
        signal: abortController.signal,
        onProgress: reportProgress,
        onStatus: setExportStatus,
      });

      if (blob.size < 1024) {
        throw new Error('Export finished without a valid MP4 payload');
      }

      const url = URL.createObjectURL(blob);
      lastExportUrlRef.current = url;
      setExportDownload(url, DEFAULT_EXPORT_FILE_NAME);
      setExportStatus('Download ready');
      triggerBlobDownload(url, DEFAULT_EXPORT_FILE_NAME);
      reportProgress(1);
    } catch (err) {
      if (!abortController.signal.aborted && !isAbortError(err)) {
        setExportError(getErrorMessage(err));
        console.error('Export failed:', err);
      }
    } finally {
      if (exportAbortRef.current === abortController) {
        exportAbortRef.current = null;
      }
      setIsExporting(false);
      setExportProgress(0);
      setExportStatus(null);
    }
  };

  const handleCancelExport = () => {
    exportAbortRef.current?.abort();
  };

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, [setIsFullscreen]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [setIsFullscreen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const state = useStore.getState();
      if (!state.isLiveMode || state.isExporting || isEditableTarget(event.target)) return;

      const key = event.key;
      if (key === '?' || (key === '/' && event.shiftKey)) {
        event.preventDefault();
        state.setLiveHelpOpen(true);
        return;
      }
      if (key === 'Escape') {
        if (state.liveHelpOpen) {
          event.preventDefault();
          state.setLiveHelpOpen(false);
        } else if (document.fullscreenElement) {
          event.preventDefault();
          document.exitFullscreen();
        }
        return;
      }
      if (key.toLowerCase() === 'h') {
        event.preventDefault();
        if (state.liveHelpOpen) {
          state.setLiveHelpOpen(false);
        } else {
          state.setLiveUiVisible(!state.liveUiVisible);
        }
        return;
      }
      if (key.toLowerCase() === 'f') {
        event.preventDefault();
        toggleFullscreen();
        return;
      }
      if (key === ' ') {
        event.preventDefault();
        state.setLiveBoost(true);
        return;
      }
      if (key === 'ArrowUp') {
        event.preventDefault();
        state.setLiveIntensity(clamp(state.liveIntensity + LIVE_INTENSITY_STEP, LIVE_INTENSITY_MIN, LIVE_INTENSITY_MAX));
        return;
      }
      if (key === 'ArrowDown') {
        event.preventDefault();
        state.setLiveIntensity(clamp(state.liveIntensity - LIVE_INTENSITY_STEP, LIVE_INTENSITY_MIN, LIVE_INTENSITY_MAX));
        return;
      }
      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        event.preventDefault();
        moveLiveSelection(key === 'ArrowRight' ? 1 : -1);
        return;
      }
      if (/^[1-5]$/.test(key)) {
        event.preventDefault();
        applyLivePresetNumber(Number(key) - 1);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        useStore.getState().setLiveBoost(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [toggleFullscreen]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        {/* Header */}
        {showChrome && (
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
            Three.js · Web Audio API · WebGL
          </Typography>
        </Box>
        )}

        {/* Main layout */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left panel */}
          {showChrome && !isFullscreen && (
            <Paper
              elevation={0}
              sx={{
                width: 220,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                p: 1.5,
                borderRadius: 0,
                borderRight: '1px solid',
                borderColor: 'divider',
                overflow: 'auto',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 9 }}>
                Input
              </Typography>
              <Uploader />

              {analysis && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 9, display: 'block', mb: 0.5 }}>
                    Waveform
                  </Typography>
                  <WaveformMini waveform={analysis.waveform} />
                </Box>
              )}
            </Paper>
          )}

          {/* Canvas */}
          <Box
            ref={containerRef}
            sx={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              <Suspense fallback={<div style={{width: '100%', height: '100%'}}/>}>
                {displayMode === 'imageFx' ? (
                  <ImageFXVisualizer exportRendererRef={exportRendererRef} />
                ) : displayMode === 'wave' ? (
                  <WaveVisualizer exportRendererRef={exportRendererRef} />
                ) : (
                  <VisualizerCanvas recorderRef={recorderRef} exportRendererRef={exportRendererRef} />
                )}
              </Suspense>

              {/* Fullscreen toggle */}
              {showChrome && (
              <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                <IconButton
                  size="small"
                  onClick={toggleFullscreen}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  {isFullscreen ? (
                    <FullscreenExitIcon fontSize="small" />
                  ) : (
                    <FullscreenIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              )}

              {/* Empty state */}
              {!analysis && showChrome && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <GraphicEqIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.15, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.4, fontSize: 12 }}>
                    Upload audio to start visualizing
                  </Typography>
                </Box>
              )}

              {isLiveMode && liveUiVisible && (
                <Paper
                  elevation={4}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: 8,
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1,
                    py: 0.5,
                    bgcolor: 'rgba(5,5,8,0.72)',
                    borderColor: 'rgba(0, 229, 238, 0.18)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Chip
                    icon={<VideocamIcon sx={{ fontSize: 14 }} />}
                    label={liveBoost ? 'BOOST' : `LIVE ${Math.round(liveIntensity * 100)}%`}
                    size="small"
                    color={liveBoost ? 'secondary' : 'primary'}
                    sx={{ height: 22, fontSize: 10, borderRadius: 1 }}
                  />
                  <Tooltip title="Hide UI (H)">
                    <IconButton size="small" onClick={() => setLiveUiVisible(false)} sx={{ color: 'text.primary', p: 0.5 }}>
                      <VisibilityOffIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Shortcuts (?)">
                    <IconButton size="small" onClick={() => setLiveHelpOpen(true)} sx={{ color: 'text.primary', p: 0.5 }}>
                      <HelpOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setIsLiveMode(false)}
                    sx={{ fontSize: 10, minWidth: 0, px: 0.75, py: 0.25 }}
                  >
                    Exit
                  </Button>
                </Paper>
              )}

              {isLiveMode && !liveUiVisible && liveHelpOpen && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: 8,
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 0.75,
                    py: 0.35,
                    borderRadius: 1,
                    bgcolor: 'rgba(5,5,8,0.72)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: 14, color: 'primary.light' }} />
                  <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                    UI hidden
                  </Typography>
                </Box>
              )}

              {isLiveMode && liveHelpOpen && (
                <LiveVJHelp
                  language={liveHelpLanguage}
                  onLanguageChange={setLiveHelpLanguage}
                  onClose={() => setLiveHelpOpen(false)}
                />
              )}
            </Box>

            {showChrome && <Timeline />}
          </Box>

          {/* Right panel */}
          {showChrome && !isFullscreen && (
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
              <Controls onExport={handleExport} onCancelExport={handleCancelExport} />
            </Paper>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === 'AbortError';
}

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Export failed unexpectedly';
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

function applyLivePresetNumber(index: number) {
  const state = useStore.getState();
  if (state.displayMode === 'visualizer3d') {
    const preset = PRESET_IDS[index];
    if (preset) state.setPreset(preset);
    return;
  }
  if (state.displayMode === 'wave') {
    const waveType = WAVE_TYPES[index];
    if (waveType) state.setWaveType(waveType);
    return;
  }

  const imageFxPreset = IMAGE_FX_PRESET_IDS[index];
  if (imageFxPreset) {
    state.setImageFxPreset(imageFxPreset, IMAGE_FX_PRESETS[imageFxPreset]);
  }
}

function moveLiveSelection(direction: 1 | -1) {
  const state = useStore.getState();
  if (state.displayMode === 'visualizer3d') {
    const index = PRESET_IDS.indexOf(state.preset);
    state.setPreset(cycleValue(PRESET_IDS, index, direction));
    return;
  }
  if (state.displayMode === 'wave') {
    const index = WAVE_TYPES.indexOf(state.waveSettings.type);
    state.setWaveType(cycleValue(WAVE_TYPES, index, direction));
    return;
  }

  const index = IMAGE_FX_PRESET_IDS.indexOf(state.imageFxSettings.preset);
  const preset = cycleValue(IMAGE_FX_PRESET_IDS, index, direction);
  state.setImageFxPreset(preset, IMAGE_FX_PRESETS[preset]);
}

function cycleValue<T>(values: T[], currentIndex: number, direction: 1 | -1): T {
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (safeIndex + direction + values.length) % values.length;
  return values[nextIndex];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function WaveformMini({ waveform }: { waveform: Float32Array }) {
  const width = 186;
  const height = 40;
  const points = Array.from(waveform);
  const step = width / points.length;

  const pathTop = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${i * step},${height / 2 - v * (height / 2 - 2)}`)
    .join(' ');
  const pathBottom = points
    .map((v, i) => `${i * step},${height / 2 + v * (height / 2 - 2)}`)
    .reverse()
    .join(' L');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path
        d={`${pathTop} L${(points.length - 1) * step},${height / 2} ${pathBottom} Z`}
        fill="rgba(0,188,212,0.25)"
        stroke="rgba(0,188,212,0.6)"
        strokeWidth="0.5"
      />
    </svg>
  );
}
