import {
  ProjectGraph,
  ProjectGraphProjectNode,
} from 'nx/src/config/project-graph';
import { filterNodes } from 'nx/src/project-graph/operators';
import { createProjectGraphAsync } from 'nx/src/project-graph/project-graph';

function projectExists(
  projects: ProjectGraphProjectNode[],
  projectToFind: string
): boolean {
  return (
    projects.find((project) => project.name === projectToFind) !== undefined
  );
}

function hasPath(
  graph: ProjectGraph,
  target: string,
  node: string,
  visited?: string[]
): boolean {
  if (target === node) return true;
  for (const d of graph.dependencies[node] || []) {
    if (visited.indexOf(d.target) > -1) continue;
    visited.push(d.target);
    if (hasPath(graph, target, d.target, visited)) {
      return true;
    }
  }
  return false;
}

function filterGraph(
  graph: ProjectGraph,
  focus: string,
  exclude: string[] = [],
  skipExternal?: boolean
): ProjectGraph {
  const projectNames = Object.values(graph.nodes).map(
    (project) => project.name
  );
  let filteredProjectNames: Set<string>;
  if (focus) {
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

export async function getProjectGraph({
  exclude = [],
  focus = null,
  skipExternal = false,
}: {
  exclude?: string[];
  focus?: string;
  skipExternal?: boolean;
} = {}): Promise<ProjectGraph> {
  /* To ensure that graph is always up to date we avoided
   * let graph;
   * try {
   *   graph = readCachedProjectGraph();
   * } catch (e) {
   *   graph = await createProjectGraphAsync();
   * }
   */
  let graph = await createProjectGraphAsync();
  if (skipExternal) {
    graph = filterNodes()(graph);
  }
  const projects = Object.values(graph.nodes);
  projects.sort((a, b) => a.name.localeCompare(b.name));
  if (focus && !projectExists(projects, focus)) {
    throw new Error(`Project to focus ${focus} does not exist.`);
  }
  if (focus || exclude.length) {
    graph = filterGraph(graph, focus, exclude, skipExternal);
  }

  return graph;
}
