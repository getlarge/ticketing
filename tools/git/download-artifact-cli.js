const axios = require('axios');
const { pipeline } = require('stream/promises');
const unzipper = require('unzipper');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { author, name } = require('../../package.json');
const { getArtifacts, getWorkflowRuns } = require('./github-methods');
const { stringIsUndefined } = require('../utils');

// get latest workflow for this branch
async function getLatestWorkflowRun({
  branch,
  githubToken,
  org,
  verbose,
  workflowId,
}) {
  if (verbose) {
    console.log(`Fetching workflow runs for ${org}/${name}:${branch}`);
  }
  const [workflowRun] = await getWorkflowRuns({
    branch,
    githubToken,
    limit: 1,
    org,
    workflowId,
  });
  return workflowRun;
}

// get workflow run artifacts and get latest build artifact
async function getArtifact(
  { githubToken, org, verbose },
  runId,
  artifactName = 'build'
) {
  if (verbose) {
    console.log(`Fetching artifact ${artifactName} from workflow run ${runId}`);
  }
  const artifacts = await getArtifacts({ githubToken, org, runId });
  return artifacts.find((art) => art.name === artifactName);
}

// download build artifact archive
async function downloadArtifact(
  { destinationPath = './dist', githubToken, verbose },
  url
) {
  if (verbose) {
    console.log(
      `Downloading artifact from ${url} in ${destinationPath} folder`
    );
  }
  const { data } = await axios(url, {
    method: 'get',
    headers: {
      authorization: `token ${githubToken}`,
    },
    responseType: 'stream',
  });
  // Whoo async pipeline
  await pipeline(data, unzipper.Extract({ path: destinationPath }));
}

(async function () {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 -g [token] -b [source_branch]')
    .options({
      githubToken: {
        description: 'Github token to read private repo',
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
        description: 'Github org name',
        demandOption: true,
        alias: 'o',
        default: author,
      },
      branch: {
        description: 'Git repo source branch to fetch workflows from',
        demandOption: true,
        alias: 'b',
      },
      workflowId: {
        description: 'Workflow file name',
        demandOption: true,
        alias: 'w',
        default: 'ci.yaml',
      },
      destinationPath: {
        description: 'Where artifacts will be unzipped',
        demandOption: true,
        alias: 'd',
        default: './dist',
      },
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging, prints timings',
    }).argv;

  try {
    const workflowRun = await getLatestWorkflowRun(argv);
    if (!(workflowRun && workflowRun.id)) {
      throw new Error(`Workflow runs not found for ${argv.branch}`);
    }
    const artifact = await getArtifact(argv, workflowRun.id);
    if (!(artifact && artifact.archive_download_url)) {
      throw new Error(
        `Artifact not available for workflow run ${workflowRun.id}`
      );
    }
    await downloadArtifact(argv, artifact.archive_download_url);
    process.exit(0);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
})();
