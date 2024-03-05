import mongoose from 'mongoose';
import { execSync } from 'node:child_process';

const cwd = process.cwd();

export default async (): Promise<void> => {
  await mongoose.connection.close();
  execSync(
    'npx ts-node --project tools/tsconfig.json tools/ory/generate-config.ts keto -e .env',
    { cwd, stdio: 'ignore' },
  );
  execSync('docker compose restart keto', { cwd, stdio: 'ignore' });
  execSync(
    'npx ts-node --project tools/tsconfig.json tools/ory/generate-config.ts kratos -e .env',
    { cwd, stdio: 'ignore' },
  );
  execSync('docker compose restart kratos', { cwd, stdio: 'ignore' });
};
