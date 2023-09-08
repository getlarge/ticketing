import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { getProjectDependenciesFiles } from './get-dependencies';

(async function () {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 -p [projects]')
    .options({
      projectName: {
        description: 'Project name',
        demandOption: true,
        example: 'auth',
        type: 'string',
        alias: 'p',
      },
      context: {
        description: 'context to define relative file paths.',
        demandOption: false,
        alias: 'c',
        type: 'string',
        default: '.',
      },
      include: {
        description: 'File patterns to include.',
        demandOption: false,
        alias: 'i',
        type: 'string',
        default: '',
        coerce: (value) => stringToArray(value, ['*.ts']),
      },
      exclude: {
        description: 'File patterns to exclude.',
        demandOption: false,
        alias: 'e',
        type: 'string',
        default: '',
        coerce: (value) => stringToArray(value, ['*spec.ts', 'jest*.ts']),
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging, prints timings',
    }).argv;

  try {
    const files = await getProjectDependenciesFiles(argv);
    console.log(JSON.stringify(files));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
