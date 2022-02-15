const axios = require('axios');
const { name } = require('../../package.json');
const { axiosBaseConfig, GITHUB_API_ROOT } = require('./constants');

async function getWorkflowRuns({ branch, githubToken, limit = 10, org, workflowId }) {
  const url = `${GITHUB_API_ROOT}/repos/${org}/${name}/actions/workflows/${workflowId}/runs?branch=${branch}&per_page=${limit}`;
  const { data: body } = await axios({
    ...axiosBaseConfig({ githubToken }),
    method: 'get',
    url,
  });
  const { workflow_runs } = body;
  return workflow_runs;
}

async function getArtifacts({ githubToken, org, runId }) {
  const url = `${GITHUB_API_ROOT}/repos/${org}/${name}/actions/runs/${runId}/artifacts`;
  const { data: body } = await axios({
    ...axiosBaseConfig({ githubToken }),
    method: 'get',
    url,
  });
  const { artifacts } = body;
  return artifacts;
}

async function dispatchWorkflow({ githubToken, inputs = {}, org, ref, workflowId }) {
  const url = `${GITHUB_API_ROOT}/repos/${org}/${name}/actions/workflows/${workflowId}/dispatches`;
  const { data } = await axios({
    ...axiosBaseConfig({ githubToken }),
    method: 'post',
    url,
    data: { inputs, ref },
  });
  return data;
}

async function enableWorkflow({ githubToken, org, workflowId }) {
  const url = `${GITHUB_API_ROOT}/repos/${org}/${name}/actions/workflows/${workflowId}/enable`;
  const { data } = await axios({
    ...axiosBaseConfig({ githubToken }),
    method: 'put',
    url,
    data: {},
  });
  return data;
}

module.exports = {
  dispatchWorkflow,
  enableWorkflow,
  getWorkflowRuns,
  getArtifacts,
};
