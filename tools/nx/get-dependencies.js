const { getProjectGraph } = require('./get-project-graph');
const minimatch = require('minimatch');

const constantDependencies = ['package.json'];

async function getProjectDependenciesFiles({
  context,
  exclude,
  include,
  projectName,
}) {
  const graph = await getProjectGraph({
    focus: projectName,
    skipExternal: true,
  });

  if (!(projectName in graph.dependencies)) {
    throw new Error(`${projectName} not found in dependencies graph`);
  }

  // we could use nodes straight away, but that might still be useful when no focus is provided to 'nx dep-graph'
  const getTargetDependencies = (target) => graph.dependencies[target];
  const getOneDependency = ({ source = '', target = '' }) => [
    { source, target },
    ...getAllDependencies(getTargetDependencies(target)),
  ];
  const getAllDependencies = (deps = []) =>
    deps.flatMap((c) => getOneDependency(c));
  const libTargets = getAllDependencies(getTargetDependencies(projectName)).map(
    ({ target }) => target
  );
  const libsDependencies = Array.from(new Set(libTargets));

  //

  const getNode = (target) => graph.nodes[target];
  const getFilesFromNode = ({ data, type }) => {
    const { files } = data;
    return files
      .filter(
        ({ file }) =>
          !exclude.some((val) => minimatch(file, val, { matchBase: true })) &&
          include.some((val) => minimatch(file, val, { matchBase: true }))
      )
      .map(({ file }) => file);
  };

  const appDependenciesFiles = getFilesFromNode(getNode(projectName));
  const libsDependenciesFiles = libsDependencies.flatMap((target) =>
    getFilesFromNode(getNode(target))
  );
  const dependenciesFiles = [
    ...constantDependencies,
    ...appDependenciesFiles,
    ...libsDependenciesFiles,
  ];

  return context === '.'
    ? dependenciesFiles
    : dependenciesFiles.map((file) => file.replace(context, ''));
}

module.exports = {
  getProjectDependenciesFiles,
};
