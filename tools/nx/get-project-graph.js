const {
  createProjectGraphAsync,
  readCachedProjectGraph,
} = require('nx/src/project-graph/project-graph');
const { filterNodes } = require('nx/src/project-graph/operators');

function projectExists(projects, projectToFind) {
  return (
    projects.find((project) => project.name === projectToFind) !== undefined
  );
}

function hasPath(graph, target, node, visited) {
  if (target === node) return true;

  for (let d of graph.dependencies[node] || []) {
    if (visited.indexOf(d.target) > -1) continue;
    visited.push(d.target);
    if (hasPath(graph, target, d.target, visited)) return true;
  }
  return false;
}

function filterGraph(graph, focus, exclude = [], skipExternal) {
  let projectNames = Object.values(graph.nodes).map((project) => project.name);
  let filteredProjectNames;
  if (focus !== null) {
    filteredProjectNames = new Set();
    projectNames.forEach((p) => {
      const isInPath =
        hasPath(graph, p, focus, []) || hasPath(graph, focus, p, []);
      if (isInPath) {
        filteredProjectNames.add(p);
      }
    });
  } else {
    filteredProjectNames = new Set(projectNames);
  }

  if (exclude.length !== 0) {
    exclude.forEach((p) => filteredProjectNames.delete(p));
  }

  const filteredGraph = Array.from(filteredProjectNames).reduce(
    (gr, p) => {
      gr.nodes[p] = graph.nodes[p];
      gr.dependencies[p] = graph.dependencies[p];
      return gr;
    },
    { nodes: {}, externalNodes: {}, dependencies: {} }
  );

  if (skipExternal) {
    delete filteredGraph.externalNodes;
  } else {
    // TODO: filter out externalNodes that are not attached to filterGraph.nodes
    filteredGraph.externalNodes = graph.externalNodes;
  }
  return filteredGraph;
}

async function getProjectGraph({
  exclude = [],
  focus = null,
  skipExternal = false,
} = {}) {
  let graph;
  try {
    graph = readCachedProjectGraph();
  } catch (e) {
    graph = await createProjectGraphAsync();
  }
  if (skipExternal) {
    graph = filterNodes()(graph);
  }
  const projects = Object.values(graph.nodes);
  projects.sort((a, b) => a.name.localeCompare(b.name));
  if (focus && !projectExists(projects, focus)) {
    throw new Error(`Project to focus ${focus} does not exist.`);
  }
  if (focus !== null || exclude.length) {
    graph = filterGraph(graph, focus, exclude, skipExternal);
  }

  return graph;
}

module.exports = {
  getProjectGraph,
};
