import { execSync } from 'node:child_process';
import yargs from 'yargs';

import { join } from 'node:path';

interface BaseOptions {
  destination: string;
  projectName: string;
  verbose?: boolean;
}

async function main() {
  await yargs(process.argv.slice(2))
    .options({
      projectName: {
        description: 'Project name',
        demandOption: true,
        example: 'identity',
        alias: 'p',
        type: 'string',
      },
      destination: {
        description: 'Export directory',
        demandOption: false,
        default: join(__dirname),
        alias: 'd',
        type: 'string',
      },
    })
    .command({
      command: 'identity',
      describe: 'Command to get identity config from Ory project',
      handler: (
        argv: yargs.ArgumentsCamelCase<
          BaseOptions & {
            _: ['identity'];
          }
        >,
      ) => {
        const { destination, projectName } = argv;
        const filepath = join(
          destination,
          `identity-config-${projectName}.json`,
        );
        execSync(
          `ory get identity-config ${projectName} --format json-pretty > ${filepath}`,
          { stdio: 'inherit' },
        );
      },
    })
    .command({
      command: 'permission',
      describe: 'Command to get permission config from Ory project',
      handler: (
        argv: yargs.ArgumentsCamelCase<
          BaseOptions & {
            _: ['permission'];
          }
        >,
      ) => {
        const { destination, projectName } = argv;
        const filepath = join(
          destination,
          `permission-config-${projectName}.json`,
        );
        execSync(
          `ory get permission-config ${projectName} --format json-pretty > ${filepath}`,
          { stdio: 'inherit' },
        );
      },
    })
    .demandCommand(1, 'A valid command must be provided')
    .fail((msg, err) => {
      if (err) throw err;
      throw new Error(msg);
    }).argv;
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
