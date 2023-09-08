import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { getAffectedProjects } from './get-affected-projects';

(async function () {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 -t [type]')
    .options({
      type: {
        description: 'Project type (app or lib)',
        demandOption: true,
        example: 'lib',
        type: 'string',
        default: 'app',
        alias: 't',
      },
      plain: {
        description:
          'Whether to output projects as comma separated string or JSON string',
        demandOption: false,
        alias: 'p',
        type: 'boolean',
        default: true,
      },
      base: {
        description: 'Base branch to compare against (usually main)',
        demandOption: false,
        alias: 'b',
        type: 'string',
        default: 'main',
      },
      head: {
        description: 'Head branch to compare against (usually HEAD)',
        demandOption: false,
        alias: 'h',
        type: 'string',
        default: 'HEAD',
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging, prints timings',
    }).argv;

  try {
    const { base, head, plain, type } = argv;
    const projects = await getAffectedProjects(type, base, head);
    if (plain) {
      console.log(projects);
    } else {
      console.log(JSON.stringify(projects.split(',')));
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
