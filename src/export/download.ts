export const DEFAULT_EXPORT_FILE_NAME = 'audio-visualizer.mp4';

export function triggerBlobDownload(url: string, fileName = DEFAULT_EXPORT_FILE_NAME) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  requestAnimationFrame(() => a.remove());
}
