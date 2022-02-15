const GITHUB_API_ROOT = 'https://api.github.com';

const axiosBaseConfig = ({ githubToken }) => ({
  responseType: 'json',
  headers: {
    accept: 'application/vnd.github.v3+json',
    authorization: `token ${githubToken}`,
  },
});

module.exports = {
  GITHUB_API_ROOT,
  axiosBaseConfig,
};
