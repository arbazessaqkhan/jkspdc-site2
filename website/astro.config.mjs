import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// Trigger reload: 2026-07-13-v2
export default defineConfig({
  output: 'server', // Server-side rendering (SSR) adapter configuration
  adapter: node({
    mode: 'standalone',
  }),
  security: {
    // Trust forwarded Host headers for the public preview/production domains so
    // Astro's CSRF origin check matches browser Origin headers behind the proxy.
    allowedDomains: [
      { hostname: '**.drytis.dev', protocol: 'https' },
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
