const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { getPackageJson, outputPackageJson } = require('../nx/get-package-json');
const { stringIsUndefined } = require('../utils');

async function buildApp({ dockerfile = 'Dockerfile', npmToken, org, projectEnv, projectName, root, tag }) {
  const packageJson = await getPackageJson({
    projectName,
    root,
    skipDev: true,
  });
  outputPackageJson({ output: 'file', outputPath: `apps/${projectName}` }, packageJson);
  execSync(`npm i --prefix apps/${projectName} --package-lock-only`, { stdio: 'inherit' });
  execSync(`npx nx run ${projectName}:build:${projectEnv}`, { stdio: 'inherit' });
  // TODO: allow skipping docker cache ? --no-cache
  execSync(
    `docker build -f ./apps/${projectName}/${dockerfile} --build-arg npm_token=${npmToken} -t ${org}/${projectName}:${tag} .`,
    { stdio: 'inherit' }
  );
}

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
      projectEnv: {
        description: 'Project environment/configuration',
        demandOption: false,
        example: 'development',
        default: 'production',
        alias: 'c',
      },
      root: {
        description: 'Project root',
        demandOption: false,
        default: process.cwd(),
        alias: 'r',
      },
      dockerfile: {
        description: 'Dockerfile name',
        demandOption: false,
        default: 'Dockerfile',
        alias: 'f',
      },
      tag: {
        description: 'Tag used for Docker image',
        demandOption: false,
        default: 'latest',
        coerce: (value) => (stringIsUndefined(value) ? 'latest' : value),
        alias: 't',
      },
      org: {
        description: 'Docker registry org',
        demandOption: false,
        alias: 'o',
        default: 's1seven',
      },
      npmToken: {
        description: 'NPM token to read private packages',
        demandOption: true,
        alias: 'n',
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging, prints timings',
    }).argv;

  try {
    await buildApp(argv);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
