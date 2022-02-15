const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

async function dotenvPush({ projectName = '' }) {
  const command = projectName
    ? `cd apps/${projectName} && dotenv-cli push`
    : 'dotenv-cli push';
  execSync(command, { stdio: 'inherit' });
}

(async function () {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 -p [projects]')
    .options({
      projectName: {
        description: 'Project name',
        demandOption: false,
        example: 'auth',
        default: '',
        alias: 'p',
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
    }).argv;

  try {
    await dotenvPush(argv);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
