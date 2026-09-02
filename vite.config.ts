import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 3000,
    open: false,
    strictPort: false,
    watch: {
      ignored: ['**/.fetched_html_backup/**', '**/untitled_folder_backup/**', '**/.tmp/**', '**/prop-firm-intelligence-platform/**', '**/all_prop_firm/**', '**/json/**', '**/dist/**', '**/*.html'],
    },
    hmr: {
      overlay: true,
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
        },
      },
    },
  },
});
