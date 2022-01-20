const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { getProjects } = require('./get-dependencies');

(async function () {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 -t [type]')
    .options({
      type: {
        description: 'Project type (app or lib)',
        demandOption: true,
        example: 'lib',
        default: 'app',
        alias: 't',
      },
      plain: {
        description: 'Wether to output projects as plain string or string',
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
      console.log(projects.join(','));
    } else {
      console.log(JSON.stringify(projects));
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
