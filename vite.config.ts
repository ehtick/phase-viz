import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function cloudflareAssetsIgnorePlugin(): Plugin {
  return {
    name: 'cloudflare-assetsignore',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: '.assetsignore',
        source: 'vendor/ffmpeg-core.wasm\n',
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflareAssetsIgnorePlugin()],
  // NOTE: The MP4 fallback loads vendored ffmpeg assets from public/vendor.
  // Keep dev headers simple so same-origin module worker imports behave like
  // production Workers Static Assets.
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const parts = id.split('node_modules/')[1].split('/');
            const pkg = parts[0].startsWith('@') ? parts.slice(0,2).join('/') : parts[0];
            return `vendor-${pkg.replace('@', '').replace('/', '-')}`;
          }
        },
      },
    },
  },
})
