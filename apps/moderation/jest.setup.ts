import { execSync } from 'node:child_process';

// eslint-disable-next-line @nx/enforce-module-boundaries
import setup from '../../tools/test/jest.mongo.setup';

const envPath = 'apps/moderation/.env.test';

const cwd = process.cwd();

export default async (): Promise<void> => {
  await setup(envPath);
  execSync(
    'npx ts-node --project tools/tsconfig.json tools/ory/generate-config.ts keto -e .env.test',
    { cwd, stdio: 'ignore' },
  );
  execSync('docker compose restart keto', { cwd, stdio: 'ignore' });
  execSync(
    'npx ts-node --project tools/tsconfig.json tools/ory/generate-config.ts kratos -e .env.test',
    { cwd, stdio: 'ignore' },
  );
  execSync('docker compose restart kratos', { cwd, stdio: 'ignore' });
};
