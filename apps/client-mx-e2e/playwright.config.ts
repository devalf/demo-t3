import { defineConfig } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';

const baseURL = process.env['BASE_URL'] || 'http://localhost:8082';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src/e2e' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
});
