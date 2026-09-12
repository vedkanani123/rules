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
    modulePreload: {
      polyfill: true,
      resolveDependencies(filename, deps) {
        return deps.filter((dep) => {
          return !dep.includes('pages-terminal') &&
                 !dep.includes('component-simulator') &&
                 !dep.includes('pages-legal') &&
                 !dep.includes('data-goat') &&
                 !dep.includes('data-extended');
        });
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (id.includes('src/data/goat')) {
            return 'data-goat';
          }
          if (id.includes('src/data/canonicalFirmsExtended')) {
            return 'data-extended';
          }
          if (id.includes('src/data/propFirmsData') || id.includes('src/data/allFirmsCanonicalData')) {
            return 'data-firms';
          }
          if (id.includes('src/pages/GoatResearchTerminal') || id.includes('src/pages/FirmResearchTerminal') || id.includes('src/pages/AdminCrawler')) {
            return 'pages-terminal';
          }
          if (id.includes('src/pages/PrivacyPolicy') || id.includes('src/pages/Terms') || id.includes('src/pages/Disclaimer') || id.includes('src/pages/Contact')) {
            return 'pages-legal';
          }
          if (id.includes('src/pages/RuleGuide') || id.includes('src/pages/RulesHub')) {
            return 'pages-rules';
          }
          if (id.includes('src/pages/ComparePage')) {
            return 'pages-compare';
          }
          if (id.includes('src/pages/FirmDetail') || id.includes('src/pages/AccountDetail')) {
            return 'pages-firms';
          }
          if (id.includes('src/components/simulator/')) {
            return 'component-simulator';
          }
        },
      },
    },
  },
});
