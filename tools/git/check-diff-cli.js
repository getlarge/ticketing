const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { detectDiff, getCurrentBranch } = require('./git-methods');
const { stringIsUndefined } = require('../utils');

(async function () {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 -g [token] -b [source_branch]')
    .options({
      base: {
        description: 'Specify base ref',
        alias: 'b',
        default: 'main',
      },
      head: {
        description: 'Specify head ref, default to current branch',
        alias: 'h',
        coerce: (value) => (stringIsUndefined(value) ? getCurrentBranch() : value),
      },
      pattern: {
        description: 'Specify path pattern to search',
        alias: 'p',
        default: '',
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging, prints timings',
    }).argv;

  try {
    const { base, head, pattern } = argv;
    const hasDiff = detectDiff(base, head, pattern);
    console.log(hasDiff);
    process.exit(0);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
})();
