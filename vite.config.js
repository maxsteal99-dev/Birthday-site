import { defineConfig } from 'vite';

// Relative base so the site works from any folder (GitHub Pages serves it under /Birthday-site/).
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    cssMinify: true,
    target: 'es2017'
  }
});
