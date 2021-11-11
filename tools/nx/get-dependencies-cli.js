const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { getProjectDependenciesFiles } = require('./get-dependencies');
const { stringToArray } = require('../utils');

(async function () {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 -p [projects]')
    .options({
      projectName: {
        description: 'Project name',
        demandOption: true,
        example: 'auth',
        alias: 'p',
      },
      context: {
        description: 'context to define relative file paths.',
        demandOption: false,
        alias: 'c',
        default: '.',
      },
      include: {
        description: 'File patterns to include.',
        demandOption: false,
        alias: 'i',
        coerce: (value) => stringToArray(value, ['*.ts', '*.tsx', '*.css']),
      },
      exclude: {
        description: 'File patterns to exclude.',
        demandOption: false,
        alias: 'e',
        coerce: (value) => stringToArray(value, ['*spec.ts', '*spec.tsx']),
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
