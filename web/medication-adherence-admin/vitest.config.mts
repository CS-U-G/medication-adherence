import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Avoid starting a separate jsdom process for every suite on constrained hosts.
    maxWorkers: 1,
    fileParallelism: false,
  },
});
