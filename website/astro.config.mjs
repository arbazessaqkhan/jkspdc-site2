import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// Trigger reload: 2026-07-13
export default defineConfig({
  output: 'server', // Server-side rendering (SSR) adapter configuration
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
