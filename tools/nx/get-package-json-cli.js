const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { getPackageJson, outputPackageJson } = require('./get-package-json');

(async function () {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 -p [projects]')
    .options({
      projectName: {
        description: 'Project name',
        demandOption: true,
        example: 'auth-service',
        alias: 'p',
      },
      root: {
        description: 'Project root',
        demandOption: false,
        default: process.cwd(),
        alias: 'r',
      },
      skipDev: {
        description: 'Wether to include devDependencies',
        demandOption: false,
        type: 'boolean',
        default: true,
        alias: 'D',
      },
      output: {
        description: 'Where to output package.json',
        demandOption: false,
        default: 'stdout',
        example: 'file',
        alias: 'o',
      },
      outputPath: {
        description: 'Where to write package.json file',
        demandOption: false,
        default: process.cwd(),
        alias: 'O',
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging, prints timings',
    }).argv;

  try {
    const packageJson = await getPackageJson(argv);
    outputPackageJson(argv, packageJson);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
