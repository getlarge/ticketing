const {
  createPackageJson,
} = require('@nrwl/workspace/src/utilities/create-package-json');
const fs = require('fs');
const { getProjectGraph } = require('./get-project-graph');

function sortDependencies(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
}

async function getPackageJson({ projectName, root, skipDev = false }) {
  const graph = await getProjectGraph();
  const { data } = graph.nodes[projectName];
  const { root: projectRoot } = data;
  const options = {
    projectRoot,
    root,
    externalDependencies: 'all',
  };

  const packageJson = createPackageJson(projectName, graph, options);
  packageJson.main = packageJson.main || 'main.js';
  packageJson.dependencies = sortDependencies(packageJson.dependencies);
  if (skipDev) {
    delete packageJson.devDependencies;
  } else {
    packageJson.devDependencies = sortDependencies(packageJson.devDependencies);
  }
  return packageJson;
}

function outputPackageJson(
  { output = 'stdout', outputPath = process.cwd() },
  packageJson = {}
) {
  const serializedPackageJson = JSON.stringify(packageJson, null, 2);
  if (output === 'stdout') {
    console.log(serializedPackageJson);
  } else if (output === 'file') {
    fs.writeFileSync(`${outputPath}/package.json`, serializedPackageJson);
  }
}

module.exports = { getPackageJson, outputPackageJson };
