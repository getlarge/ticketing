import { readProjectConfiguration } from '@nx/devkit';
import { execSync } from 'node:child_process';
import { FsTree } from 'nx/src/generators/tree';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';


const getAffectedProjects = (projects = []) => {
  if (projects.length) {
    return projects;
  }
  const affectedLibs = execSync(
    `npx nx print-affected --type=lib --select=projects --exclude=platform`,
    { encoding: 'utf8' }
  );
  const affectedApps = execSync(
    `npx nx print-affected --type=app --select=projects`,
    { encoding: 'utf8' }
  );

  return [
    ...affectedLibs.split(',').map((p) => p.replace('\n', '').trim()),
    ...affectedApps.split(',').map((p) => p.replace('\n', '').trim()),
  ].filter((v) => !!v);
};

const exec = (cmd: () => void, type: 'eslint' | 'stylelint') => {
  try {
    cmd();
  } catch (e) {
    throw new Error(`${type} failed, see details in the jobs output`);
  }
};

const getTargetIncludePath = (
  host: FsTree,
  projectName: string,
  target: 'lint' | 'stylelint'
): string[] => {
  const cfg = readProjectConfiguration(host, projectName);
  if (!!cfg.targets && cfg.targets[target]) {
    return (cfg.targets[target].options.lintFilePatterns || [cfg.root]).map(
      (path) => `"${path}"`
    );
  }
  return [];
};

const getTargetPaths = (
  host: FsTree,
  projectNames: string[],
  target: 'lint' | 'stylelint'
): string =>
  projectNames
    .flatMap((projectName) => getTargetIncludePath(host, projectName, target))
    .join(' ');

const fastLint = ({
  projects,
  verbose,
}: {
  projects: string[],
  verbose?: boolean,
}): void => {
  const affectedProjects = getAffectedProjects(projects);
  if (affectedProjects.length === 0) {
    return;
  }
  const host = new FsTree(process.cwd(), verbose);
  const lintProjects = getTargetPaths(host, affectedProjects, 'lint');
  const stylelintProjects = getTargetPaths(host, affectedProjects, 'stylelint');
  if (verbose) {
    process.env.TIMING = '1';
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

(async function () {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 -p [projects]')
    .options({
      projects: {
        description: 'comma-separated list of projects to lint',
        demandOption: false,
        example: 'frontend,backend',
        alias: 'p',
        default: '',
        type:'string',
        coerce: (value) => value.split(',').map((v) => v.trim())
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging, prints timings',
    }).argv;

  try {
    fastLint(argv);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
