import { execSync } from 'child_process';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { getPackageJson, outputPackageJson } from '../nx/get-package-json';

async function regeneratePackageJson({ projectName, root }) {
  const packageJson = await getPackageJson({
    projectName,
    root,
    skipDev: true,
  });
  outputPackageJson(
    { output: 'file', outputPath: `apps/${projectName}` },
    packageJson
  );
  execSync(`npm i --prefix apps/${projectName} --package-lock-only --force`, {
    stdio: 'inherit',
  });
}

(async function () {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 -p [projects]')
    .options({
      projectName: {
        description: 'Project name',
        demandOption: true,
        example: 'auth',
        alias: 'p',
      },
      root: {
        description: 'Project root',
        demandOption: false,
        default: process.cwd(),
        alias: 'r',
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
