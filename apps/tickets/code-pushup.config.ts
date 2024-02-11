import coveragePlugin from '@code-pushup/coverage-plugin';
import eslintPlugin from '@code-pushup/eslint-plugin';
import type { CoreConfig } from '@code-pushup/models';

const config: CoreConfig = {
  plugins: [
    await eslintPlugin({
      eslintrc: '.eslintrc.json',
      patterns: ['src/**/*.ts'],
    }),
    coveragePlugin({
      reports: [{ resultsPath: 'coverage/apps/tickets/lcov.info' }],
      //   coverageToolCommand: {
      //     command: 'NODE_OPTIONS=--experimental-vm-modules npx',
      //     args: ['nx', 'run', 'tickets:test'],
      //   },
    }),
  ],
  persist: {
    outputDir: '.code-pushup/reports/apps/tickets',
    format: ['md', 'json'],
  },
};

export default config;
