const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { dispatchWorkflow } = require('./github-methods');
const { deserializeToObject, stringIsUndefined } = require('../utils');
const { author } = require('../../package.json');

async function triggerWorflow({ githubToken, org, ref, inputs, verbose, workflowId }) {
  if (verbose) {
    console.log(`Trigger workflow ${workflowId} on ref ${ref}`);
  }
  const response = await dispatchWorkflow({ githubToken, inputs, org, ref, workflowId });
  if (verbose) {
    console.log(`Workflow trigggered successfully`, response);
  }
}

(async function () {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 -g [token] -b [source_branch]')
    .options({
      githubToken: {
        description: 'Github token to read private repo',
        demandOption: true,
        alias: 'g',
        coerce: (value) => {
          if (stringIsUndefined(value) && !process.env['GITHUB_TOKEN']) {
            throw Error('Environment variable GITHUB_TOKEN is missing');
          }
          return value || process.env.GITHUB_TOKEN;
        },
      },
      org: {
        description: 'Github org name',
        demandOption: true,
        alias: 'o',
        default: author,
      },
      workflowId: {
        description: 'The ID of the workflow. You can also pass the workflow file name as a string.',
        alias: 'w',
        default: 'main',
      },
      ref: {
        description: 'Specify the git reference for the workflow. The reference can be a branch or tag name.',
        alias: 'r',
        default: 'main',
      },
      inputs: {
        description: 'Input keys and values configured in the workflow file. The maximum number of properties is 10',
        alias: 'i',
        coerce: (value) => (stringIsUndefined(value) ? value : deserializeToObject(value)),
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging, prints timings',
    }).argv;

  try {
    await triggerWorflow(argv);
    process.exit(0);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
})();
