// @ts-check
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// The GitHub Pages build sets PAGES=1 so the site is emitted under /panarium/.
// Local dev and any root deploy leave base at '/'.
const onPages = process.env.PAGES === '1';

export default defineConfig({
  site: onPages ? 'https://davidleimroth.github.io' : 'https://panarium.example.com',
  base: onPages ? '/panarium' : undefined,
  integrations: [react()],
  devToolbar: { enabled: false },
  server: { port: Number(process.env.PORT) || 4321 },
});
