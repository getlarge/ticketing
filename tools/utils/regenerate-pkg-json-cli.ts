import { execSync } from 'node:child_process';
import { unlink } from 'node:fs/promises';
import yargs from 'yargs';
import { getPackageJson, outputPackageJson } from '../nx/get-package-json';

async function regeneratePackageJson({
  clean,
  projectName,
  root,
}: {
  clean: boolean;
  projectName: string;
  root: string;
}) {
  const packageJson = await getPackageJson({
    projectName,
    root,
    skipDev: true,
  });
  if (clean) {
    await unlink(`apps/${projectName}/package-lock.json`).catch(() => {});
    await unlink(`apps/${projectName}/package.json`).catch(() => {});
  }
  outputPackageJson(
    { output: 'file', outputPath: `apps/${projectName}` },
    packageJson,
  );
  execSync(`npm i --prefix apps/${projectName} --package-lock-only --force`, {
    stdio: 'inherit',
  });
}

(async function () {
  const argv = await yargs()
    .usage('Usage: $0 -p [projects]')
    .options({
      projectName: {
        description: 'Project name',
        demandOption: true,
        example: 'auth',
        alias: 'p',
        type: 'string',
      },
      root: {
        description: 'Project root',
        demandOption: false,
        default: process.cwd(),
        alias: 'r',
        type: 'string',
      },
      clean: {
        description: 'Clean package-lock.json',
        demandOption: false,
        default: false,
        alias: 'c',
        type: 'boolean',
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging, prints timings',
    }).argv;

  try {
    await regeneratePackageJson(argv);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
