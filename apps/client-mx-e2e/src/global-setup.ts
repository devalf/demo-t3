import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Add a small delay between worker startups to prevent race conditions
  const workerIndex = parseInt(process.env.TEST_WORKER_INDEX || '0');

  if (workerIndex > 0) {
    const delay = workerIndex * 1000; // 1 second delay per worker

    console.log(`Worker ${workerIndex}: Waiting ${delay}ms before starting...`);

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export default globalSetup;
