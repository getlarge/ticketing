const { execSync } = require('child_process');
const dotenv = require('dotenv');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

async function dotenvPull({
  projectName = '',
  environment = 'development',
  fileName = '.env',
  me = '',
}) {
  if (!fileName) {
    fileName = environment === 'development' ? '.env' : `.env.${environment}`;
  }
  const { parsed = {} } = dotenv.config({
    path: `apps/${projectName}/.env.me`,
  });
  me = parsed.DOTENV_ME || me;
  const command = projectName
    ? `cd apps/${projectName} && dotenv-cli pull`
    : 'dotenv-cli pull';
  execSync(`${command} ${environment} ${fileName} -m ${me}`, {
    stdio: 'inherit',
  });
}

(async function () {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 -p [projects]')
    .options({
      projectName: {
        description: 'Project name',
        demandOption: true,
        example: 'auth',
        default: '',
        alias: 'p',
      },
      environment: {
        description: 'Pull .env.ci, .env.staging, and .env.production',
        demandOption: false,
        example: 'ci',
        default: 'development',
        coerce: (value) => {
          const allowedEnvs = ['development', 'ci', 'staging', 'production'];
          if (allowedEnvs.includes(value)) {
            return value;
          }
          throw new TypeError(`Environment should be one of ${allowedEnvs}`);
        },
        alias: 'c',
      },
      fileName: {
        description:
          'Set output filename. Defaults to .env for development and .env.{environment} for other environments',
        demandOption: false,
        example: '.env.ci',
        default: '.env',
        alias: 'f',
      },
      me: {
        description:
          'pass value for .env.me rather than reading from .env.me file',
        demandOption: false,
        alias: 'm',
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
    }).argv;

  try {
    await dotenvPull(argv);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
