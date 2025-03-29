import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,ts}'],
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src')
    },
  },
});
