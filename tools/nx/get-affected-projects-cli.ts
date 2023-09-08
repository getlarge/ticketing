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
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging, prints timings',
    }).argv;

  try {
    const { plain, type } = argv;
    const projects = await getAffectedProjects(type);
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
