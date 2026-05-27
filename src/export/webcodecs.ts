import { ArrayBufferTarget, Muxer } from 'mp4-muxer';

interface WebCodecsExportOptions {
  canvas: HTMLCanvasElement;
  audioBuffer: AudioBuffer;
  duration: number;
  fps: number;
  renderFrame: (time: number, frame: number) => void;
  onProgress: (progress: number) => void;
  signal?: AbortSignal;
}

const VIDEO_CODEC = 'avc1.42001f';
const AUDIO_CODEC = 'mp4a.40.2';
const AUDIO_CHUNK_SIZE = 8192;
const MAX_VIDEO_QUEUE_SIZE = 24;

export function canUseWebCodecsMP4() {
  return typeof VideoEncoder !== 'undefined'
    && typeof VideoFrame !== 'undefined'
    && typeof AudioEncoder !== 'undefined'
    && typeof AudioData !== 'undefined';
}

export async function exportToMP4WithWebCodecs({
  canvas,
  audioBuffer,
  duration,
  fps,
  renderFrame,
  onProgress,
  signal,
}: WebCodecsExportOptions): Promise<void> {
  throwIfAborted(signal);

  const width = makeEven(canvas.width || canvas.clientWidth);
  const height = makeEven(canvas.height || canvas.clientHeight);
  const totalFrames = Math.max(1, Math.ceil(duration * fps));
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: 'avc', width, height, frameRate: fps },
    audio: {
      codec: 'aac',
      numberOfChannels: audioBuffer.numberOfChannels,
      sampleRate: audioBuffer.sampleRate,
    },
    fastStart: {
      expectedVideoChunks: totalFrames,
      expectedAudioChunks: Math.ceil(audioBuffer.length / AUDIO_CHUNK_SIZE),
    },
  });

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (err) => {
      throw err;
    },
  });
  const audioEncoder = new AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: (err) => {
      throw err;
    },
  });

  const abortEncoding = () => {
    videoEncoder.close();
    audioEncoder.close();
  };
  signal?.addEventListener('abort', abortEncoding, { once: true });

  try {
    await configureEncoders(videoEncoder, audioEncoder, width, height, fps, audioBuffer);

    let videoProgress = 0;
    let audioProgress = 0;
    const updateEncodeProgress = () => {
      onProgress(Math.min(0.94, videoProgress * 0.78 + audioProgress * 0.16));
    };
    const audioPromise = (async () => {
      await encodeAudio(audioEncoder, audioBuffer, (p) => {
        audioProgress = p;
        updateEncodeProgress();
      }, signal);
      await audioEncoder.flush();
      audioProgress = 1;
      updateEncodeProgress();
    })();

    for (let frame = 0; frame < totalFrames; frame++) {
      throwIfAborted(signal);
      const time = frame / fps;
      renderFrame(time, frame);

      const videoFrame = new VideoFrame(canvas, {
        visibleRect: { x: 0, y: 0, width, height },
        displayWidth: width,
        displayHeight: height,
        timestamp: Math.round(time * 1_000_000),
        duration: Math.round(1_000_000 / fps),
      });
      videoEncoder.encode(videoFrame, { keyFrame: frame % (fps * 2) === 0 });
      videoFrame.close();

      if (videoEncoder.encodeQueueSize > MAX_VIDEO_QUEUE_SIZE) {
        await waitForVideoQueue(videoEncoder, Math.floor(MAX_VIDEO_QUEUE_SIZE / 2), signal);
      }

      if (frame % 10 === 0 || frame === totalFrames - 1) {
        videoProgress = (frame + 1) / totalFrames;
        updateEncodeProgress();
        await yieldToBrowser();
      }
    }

    await videoEncoder.flush();
    videoProgress = 1;
    updateEncodeProgress();
    await audioPromise;

    throwIfAborted(signal);
    muxer.finalize();
    onProgress(0.97);

    downloadBlob(new Blob([target.buffer], { type: 'video/mp4' }), 'audio-visualizer.mp4');
    onProgress(1);
  } finally {
    signal?.removeEventListener('abort', abortEncoding);
    closeEncoder(videoEncoder);
    closeEncoder(audioEncoder);
  }
}

async function configureEncoders(
  videoEncoder: VideoEncoder,
  audioEncoder: AudioEncoder,
  width: number,
  height: number,
  fps: number,
  audioBuffer: AudioBuffer,
) {
  const videoBaseConfig: VideoEncoderConfig = {
    codec: VIDEO_CODEC,
    width,
    height,
    bitrate: Math.min(16_000_000, Math.max(4_000_000, width * height * fps * 0.16)),
    framerate: fps,
    avc: { format: 'avc' },
  };
  const videoConfigs: VideoEncoderConfig[] = [{
    ...videoBaseConfig,
    hardwareAcceleration: 'prefer-hardware',
    latencyMode: 'realtime',
  }, {
    ...videoBaseConfig,
    hardwareAcceleration: 'no-preference',
    latencyMode: 'realtime',
  }, {
    ...videoBaseConfig,
    latencyMode: 'quality',
  }];
  const audioConfig: AudioEncoderConfig = {
    codec: AUDIO_CODEC,
    sampleRate: audioBuffer.sampleRate,
    numberOfChannels: audioBuffer.numberOfChannels,
    bitrate: 192_000,
  };

  const [supportedVideoConfig, audioSupport] = await Promise.all([
    getSupportedVideoConfig(videoConfigs),
    AudioEncoder.isConfigSupported(audioConfig),
  ]);

  if (!supportedVideoConfig || !audioSupport.supported) {
    throw new Error('WebCodecs MP4 export is not supported in this browser');
  }

  videoEncoder.configure(supportedVideoConfig);
  audioEncoder.configure(audioSupport.config ?? audioConfig);
}

async function getSupportedVideoConfig(configs: VideoEncoderConfig[]) {
  for (const config of configs) {
    const support = await VideoEncoder.isConfigSupported(config);
    if (support.supported) {
      return support.config ?? config;
    }
  }
  return null;
}

async function encodeAudio(
  encoder: AudioEncoder,
  buffer: AudioBuffer,
  onProgress: (progress: number) => void,
  signal?: AbortSignal,
) {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const channelData = Array.from({ length: channels }, (_, ch) => buffer.getChannelData(ch));

  for (let start = 0; start < buffer.length; start += AUDIO_CHUNK_SIZE) {
    throwIfAborted(signal);
    const frames = Math.min(AUDIO_CHUNK_SIZE, buffer.length - start);
    const data = new Float32Array(frames * channels);

    for (let ch = 0; ch < channels; ch++) {
      data.set(channelData[ch].subarray(start, start + frames), ch * frames);
    }

    const audioData = new AudioData({
      format: 'f32-planar',
      sampleRate,
      numberOfFrames: frames,
      numberOfChannels: channels,
      timestamp: Math.round(start / sampleRate * 1_000_000),
      data,
    });
    encoder.encode(audioData);
    audioData.close();

    if (encoder.encodeQueueSize > 16) {
      await encoder.flush();
    }
    if (start % (AUDIO_CHUNK_SIZE * 16) === 0 || start + frames >= buffer.length) {
      onProgress((start + frames) / buffer.length);
      await yieldToBrowser();
    }
  }
}

async function waitForVideoQueue(
  encoder: VideoEncoder,
  targetSize: number,
  signal?: AbortSignal,
) {
  while (encoder.encodeQueueSize > targetSize) {
    throwIfAborted(signal);
    await yieldToBrowser();
  }
}

function yieldToBrowser(): Promise<void> {
  const scheduler = (globalThis as {
    scheduler?: { yield?: () => Promise<void> };
  }).scheduler;
  return scheduler?.yield?.() ?? new Promise((resolve) => setTimeout(resolve, 0));
}

function closeEncoder(encoder: VideoEncoder | AudioEncoder) {
  if (encoder.state !== 'closed') {
    encoder.close();
  }
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function makeEven(value: number) {
  return Math.max(2, Math.floor(value / 2) * 2);
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException('Export was canceled', 'AbortError');
  }
}
