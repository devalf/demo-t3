import React from 'react';
import { createRoot } from 'react-dom/client';

import App from '../app';

import { initApp } from './init-app';

export async function bootstrap(): Promise<void> {
  await initApp();

  const rootElement = document.getElementById('app');

  if (!rootElement) throw new Error('Failed to find the root element');

  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
