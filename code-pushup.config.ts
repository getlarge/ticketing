import coveragePlugin, {
  CoveragePluginConfig,
} from '@code-pushup/coverage-plugin';
import eslintPlugin, {
  eslintConfigFromNxProjects,
} from '@code-pushup/eslint-plugin';
import type { CoreConfig } from '@code-pushup/models';
import { glob } from 'glob';

const coverageConfig: CoveragePluginConfig = {
  reports: glob.sync('coverage/**/lcov.info').map((resultsPath) => ({
    resultsPath,
  })),
  //   coverageToolCommand: {
  //     command: 'NODE_OPTIONS=--experimental-vm-modules npx',
  //     args: ['nx', 'run', 'tickets:test'],
  //   },
};

const config: CoreConfig = {
  plugins: [
    await eslintPlugin(await eslintConfigFromNxProjects()),
    await coveragePlugin(coverageConfig),
  ],
  persist: {
    outputDir: '.code-pushup',
    format: ['json', 'md'],
  },
  upload: {
    server:
      process.env.CODE_PUSHUP_API_URL ??
      'https://api.staging.code-pushup.dev/graphql',
    apiKey: process.env.CODE_PUSHUP_API_KEY ?? '',
    organization: 'code-pushup',
    project: 'ticketing',
  },
};

export default config;
