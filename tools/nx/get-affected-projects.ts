import { exec } from 'child_process';
import { promisify } from 'util';

import { isSupportedProjectType, supportedProjectTypes } from './helpers';

const execAsync = promisify(exec);

/**
 * we wrap the original CLI call to get rid of the NX warning:
 *  NX  Use `nx show --affected`, `nx affected --graph` or `nx graph --affected` depending on which best suits your use case. The `print-affected` command will be removed in Nx 18.
 */
export async function getAffectedProjects(searchType: string): Promise<string> {
  if (!isSupportedProjectType(searchType)) {
    throw new Error(`Supported project types are ${supportedProjectTypes}`);
  }
  const { stdout } = await execAsync(
    `nx print-affected --type=${searchType} --select=projects --exclude=platform,tools`
  );
  return stdout;
}
