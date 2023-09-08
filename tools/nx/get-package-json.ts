import { createPackageJson } from '@nx/js';
import fs from 'node:fs';
import type { PackageJson } from 'nx/src/utils/package-json';

import { getProjectGraph } from './get-project-graph';
import rootPackageJson from '../../package.json';

function sortDependencies(obj: object = {}) {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
}

export async function getPackageJson({
  projectName,
  root,
  skipDev = false,
  skipPeer = false,
  isProduction = false,
  implicitDeps = [],
}: {
  projectName: string;
  root: string;
  skipDev?: boolean;
  skipPeer?: boolean;
  isProduction?: boolean;
  implicitDeps?: string[];
}): Promise<PackageJson> {
  const graph = await getProjectGraph();
  const { type } = graph.nodes[projectName];
  if (type !== 'app') {
    throw new Error(
      `Project ${projectName} is not an application. Only applications can be packaged.`
    );
  }
  const packageJson = createPackageJson(projectName, graph, {
    root,
    isProduction,
  });
  packageJson.main = packageJson.main || 'main.js';
  packageJson.version = rootPackageJson.version;
  //? tslib is always added by Nx when using generatePackageJson option, should we add it ?
  for (const dep of implicitDeps) {
    packageJson.dependencies[dep] =
      rootPackageJson.dependencies[dep] || rootPackageJson.devDependencies[dep];
  }
  packageJson.dependencies = sortDependencies(packageJson.dependencies);
  if (skipDev || isProduction) {
    delete packageJson.devDependencies;
  } else {
    packageJson.devDependencies = sortDependencies(packageJson.devDependencies);
  }

  if (skipPeer || isProduction) {
    delete packageJson?.peerDependencies;
  } else {
    packageJson.peerDependencies = sortDependencies(
      packageJson.peerDependencies
    );
  }
  return packageJson;
}

export function outputPackageJson(
  {
    output = 'stdout',
    outputPath = process.cwd(),
  }: { output?: string; outputPath?: string },
  packageJson = {}
): void {
  const serializedPackageJson = JSON.stringify(packageJson, null, 2);
  if (output === 'stdout') {
    console.log(serializedPackageJson);
  } else if (output === 'file') {
    fs.writeFileSync(
      `${outputPath}/package.json`,
      `${serializedPackageJson}\n`
    );
  }
}
