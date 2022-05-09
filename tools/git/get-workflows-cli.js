const { get } = require('lodash');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { author } = require('../../package.json');
const { getWorkflowRuns } = require('./github-methods');
const { stringIsUndefined } = require('../utils');

(async function () {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 -g [token] -b [source_branch]')
    .options({
      githubToken: {
        description: 'Github token to read/write to repo',
        demandOption: true,
        alias: 'g',
        default: '',
        coerce: (value) => {
          if (stringIsUndefined(value) && !process.env['GITHUB_TOKEN']) {
            throw Error('Environment variable GITHUB_TOKEN is missing');
          }
          return value || process.env.GITHUB_TOKEN;
        },
      },
      org: {
        description: 'Github org / user name',
        demandOption: true,
        alias: 'o',
        default: author,
      },
      branch: {
        description: 'Git repo source branch to fetch workflows from',
        demandOption: true,
        alias: 'b',
      },
      conclusion: {
        description:
          'Filter workflows by conclusion status (success, completed...)',
        alias: 'c',
      },
      workflowId: {
        description:
          'Filter workflows by workflow name (workflow must have name property)',
        alias: 'w',
        default: 'ci.yaml',
      },
      event: {
        description: 'Filter workflows by trigger (push, pull request, issue)',
        alias: 'e',
      },
      items: {
        description: 'Max items to return',
        alias: 'i',
        type: 'number',
        default: 0,
      },
      path: {
        description: 'Retrieve specific property',
        alias: 'p',
        example: 'head_commit.id',
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging, prints timings',
    }).argv;

  try {
    const { conclusion, event, items, path } = argv;
    const workflowRuns = await getWorkflowRuns(argv);
    const filters = [
      { property: 'conclusion', value: conclusion },
      { property: 'event', value: event },
    ].filter(({ value }) => !!value);

    const filteredRuns = workflowRuns
      .filter((run) =>
        filters.length
          ? filters.every(({ property, value }) => run[property] === value)
          : true
      )
      .map((run) => (path ? get(run, path) : run));

    const result = items ? filteredRuns.slice(0, items) : filteredRuns[0];
    console.log(result);
    process.exit(0);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
})();
