import glob from 'glob';
import { minimatch } from 'minimatch';
import type {
  ProjectGraphDependency,
  ProjectGraphProjectNode,
} from 'nx/src/config/project-graph';

import { getProjectGraph } from './get-project-graph';
import { isSupportedProjectType, supportedProjectTypes } from './helpers';

const excludedProjects = ['platform'];

export async function getProjects(searchType = 'app'): Promise<string[]> {
  if (!isSupportedProjectType(searchType)) {
    throw new Error(`Supported project types are ${supportedProjectTypes}`);
  }
  const graph = await getProjectGraph({
    skipExternal: true,
  });
  return Object.keys(graph.nodes)
    .map((name) => {
      const { type } = graph.nodes[name];
      return type === searchType ? name : null;
    })
    .filter((e) => !!e && !excludedProjects.includes(e));
}

export async function getProjectDependenciesFiles({
  context,
  exclude = [],
  include = [],
  projectName,
}: {
  context: string;
  exclude?: string[];
  include?: string[];
  projectName: string;
}): Promise<string[]> {
  const graph = await getProjectGraph({
    focus: projectName,
    skipExternal: true,
  });

  if (!(projectName in graph.dependencies)) {
    throw new Error(`${projectName} not found in dependencies graph`);
  }

  // we could use nodes straight away, but that might still be useful when no focus is provided to 'nx dep-graph'
  const getTargetDependencies = (target: string): ProjectGraphDependency[] =>
    graph.dependencies[target];
  const getOneDependency = ({ source = '', target = '' }) => [
    { source, target },
    ...getAllDependencies(getTargetDependencies(target)),
  ];

  const getAllDependencies = (deps = []) =>
    deps.flatMap((c) => getOneDependency(c));

  const libTargets: string[] = getAllDependencies(
    getTargetDependencies(projectName)
  ).map(({ target }) => target);
  const libsDependencies = Array.from(new Set(libTargets));

  //
  const getNode = (target: string) => graph.nodes[target];
  const getFilesFromNode = ({ data }: ProjectGraphProjectNode) => {
    const { sourceRoot } = data;
    /**
     * graph.nodes[${target}]data.files is not available anymore in Nx 16+,
     * so we retrieve those values with glob using the sourceRoot
     */
    const files = glob.sync(`${sourceRoot}/**/*.ts`, {});
    return files.filter(
      (file) =>
        !exclude.some((val) => minimatch(file, val, { matchBase: true })) &&
        include.some((val) => minimatch(file, val, { matchBase: true }))
    );
  };

  const appDependenciesFiles = getFilesFromNode(getNode(projectName));
  const libsDependenciesFiles = libsDependencies.flatMap((target) =>
    getFilesFromNode(getNode(target))
  );
  const dependenciesFiles = [...appDependenciesFiles, ...libsDependenciesFiles];

  return context === '.'
    ? dependenciesFiles
    : dependenciesFiles.map((file) => file.replace(context, ''));
}
