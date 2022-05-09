const { execSync } = require('child_process');
const { FsTree } = require('@nrwl/tao/src/shared/tree');
const { readProjectConfiguration } = require('@nrwl/devkit');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { stringToArray } = require('../utils');

const getAffectedProjects = (projects = []) => {
  if (projects.length) {
    return projects;
  }
  const affectedLibs = execSync(
    'npx nx affected:libs --exclude=workspace --plain',
    { encoding: 'utf8' }
  );
  const affectedApps = execSync(
    'npx nx affected:apps --exclude=workspace --plain',
    { encoding: 'utf8' }
  );
  return [
    ...affectedLibs.split(' ').map((p) => p.replace('\n', '').trim()),
    ...affectedApps.split(' ').map((p) => p.replace('\n', '').trim()),
  ].filter((v) => !!v);
};

const fastLint = ({ projects, verbose }) => {
  const affectedProjects = getAffectedProjects(projects);
  if (affectedProjects.length === 0) {
    return;
  }
  const host = new FsTree(process.cwd());
  const lintProjects = getTargetPaths(host, affectedProjects, 'lint');
  const stylelintProjects = getTargetPaths(host, affectedProjects, 'stylelint');
  if (verbose) {
    process.env.TIMING = 1;
  }
  if (lintProjects.length) {
    const command = verbose
      ? `npx eslint ${lintProjects} --no-error-on-unmatched-pattern`
      : `npx eslint ${lintProjects} --quiet --no-error-on-unmatched-pattern`;
    exec(() => execSync(command, { stdio: 'inherit' }), 'eslint');
  }
  if (stylelintProjects.length) {
    const command = verbose
      ? `npx stylelint ${stylelintProjects}`
      : `npx stylelint ${stylelintProjects} --quiet`;
    exec(() => execSync(command, { stdio: 'inherit' }), 'stylelint');
  }
};

const exec = (cmd, type) => {
  try {
    cmd();
  } catch (e) {
    throw new Error(`${type} failed, see details in the jobs output`);
  }
};

const getTargetIncludePath = (host, project, target) => {
  const cfg = readProjectConfiguration(host, project);
  if (!!cfg.targets && cfg.targets[target]) {
    return (cfg.targets[target].options.lintFilePatterns || [cfg.root]).map(
      (path) => `"${path}"`
    );
  }
  return [];
};

const getTargetPaths = (host, projects, target) =>
  projects
    .flatMap((project) => getTargetIncludePath(host, project, target))
    .join(' ');

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 -p [projects]')
  .options({
    projects: {
      description: 'comma-separated list of projects to lint',
      demandOption: false,
      example: 'frontend,backend',
      alias: 'p',
      default: '',
      coerce: (value) => stringToArray(value, []),
    },
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging, prints timings',
  }).argv;

(function () {
  try {
    fastLint(argv);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
