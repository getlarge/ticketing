const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { getPackageJson, outputPackageJson } = require('../nx/get-package-json');
const { stringIsUndefined } = require('../utils');
const { name } = require('../../package.json');

async function buildApp({
  dockerfile = 'Dockerfile',
  org,
  projectEnv,
  projectName,
  root,
  tag,
}) {
  // const skipDev = projectEnv === 'production';
  const skipDev = true
  const packageJson = await getPackageJson({
    projectName,
    root,
    skipDev,
  });
  outputPackageJson(
    { output: 'file', outputPath: `apps/${projectName}` },
    packageJson
  );
  execSync(`npm i --prefix apps/${projectName} --package-lock-only`, {
    stdio: 'inherit',
  });

  // TODO: allow skipping docker cache ? --no-cache
  execSync(`npx nx run ${projectName}:build:${projectEnv}`, {
    stdio: 'inherit',
  });
  execSync(
    `docker build -f ./apps/${projectName}/${dockerfile} --build-arg APP_NAME=${projectName} -t ${org}/${name}-${projectName}:${tag} .`,
    { stdio: 'inherit' }
  );

  // execSync(
  //   `docker build -f ./apps/${projectName}/${dockerfile} --build-arg APP_NAME=${projectName}\
  //   --build-arg NODE_ENV=${projectEnv} --build-arg BUILD_FLAG=""\
  //   --cache-from ${org}/${name}:nx-base -t ${org}/${name}-${projectName}:${tag} .`,
  //   { stdio: 'inherit' }
  // );
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
        coerce: (value) => (stringIsUndefined(value) ? 'production' : value),
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
        coerce: (value) => (stringIsUndefined(value) ? 'Dockerfile' : value),
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
        // default: 'getlarge',
        default: 'ghcr.io/getlarge',
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
