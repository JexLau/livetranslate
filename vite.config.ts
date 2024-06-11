import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import makeManifest from './utils/plugins/make-manifest';
import buildContentScript from './utils/plugins/build-content-script';
import { outputFolderName } from './utils/constants';
import copyI18n from './utils/plugins/copy-i18n';

const root = resolve(__dirname, 'src');
const pagesDir = resolve(root, 'pages');
const assetsDir = resolve(root, 'assets');
const compDir = resolve(root, 'components');
// const hooksDir = resolve(root, 'hooks');
const outDir = resolve(__dirname, `${outputFolderName}`); //  ${pkg.version}
const publicDir = resolve(__dirname, 'public');

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@src': root,
      '@assets': assetsDir,
      '@pages': pagesDir,
      '@components': compDir,
    },
  },
  plugins: [react(), makeManifest(), buildContentScript(), copyI18n()],
  publicDir,
  build: {
    outDir,
    sourcemap: process.env.__DEV__ === 'true',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        // devtools: resolve(pagesDir, 'devtools', 'index.html'),
        // panel: resolve(pagesDir, 'panel', 'index.html'),
        background: resolve(pagesDir, 'background', 'index.ts'),
        popup: resolve(pagesDir, 'popup', 'index.html'),
        // newtab: resolve(pagesDir, 'newtab', 'index.html'),
        // options: resolve(pagesDir, 'options', 'index.html'),
      },
      output: {
        entryFileNames: (chunk) => `src/pages/${chunk.name}/index.js`,
      },
    },
  },
});
