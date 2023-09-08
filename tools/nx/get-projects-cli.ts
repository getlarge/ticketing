import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { getProjects } from './get-dependencies';

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
        default: false,
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging, prints timings',
    }).argv;

  try {
    const { plain, type } = argv;
    const projects = await getProjects(type);
    if (plain) {
      console.log(projects.map((p) => p.trim()).join(','));
    } else {
      console.log(JSON.stringify(projects));
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
