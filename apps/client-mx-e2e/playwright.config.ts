import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';

const CLIENT_MX_PORT = process.env['NX_PUBLIC_CLIENT_MX_PORT'];
const appUrl = `http://localhost:${CLIENT_MX_PORT || 8082}`;

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src/e2e' }),
  use: {
    baseURL: appUrl,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
