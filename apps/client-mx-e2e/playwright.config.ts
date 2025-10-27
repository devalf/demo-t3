import * as path from 'path';

import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const CLIENT_MX_PORT = process.env['NX_PUBLIC_CLIENT_MX_PORT'] || '8082';
const appUrl = `http://localhost:${CLIENT_MX_PORT}`;

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src/e2e' }),
  globalSetup: require.resolve('./src/global-setup'),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 6,
  reporter: 'list',
  use: {
    baseURL: appUrl,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // Webkit/Safari skipped - has different cookie/session handling that causes test failures
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
