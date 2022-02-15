const { execSync } = require('child_process');

function detectDiff(base, currentBranch, path) {
  try {
    execSync(`git --no-pager diff ${base}..${currentBranch} --quiet --exit-code -- "${path}"`);
    return false;
  } catch (e) {
    // there is diff when exit code !== 0
    return true;
  }
}

function getCurrentBranch(ref = 'HEAD') {
  return execSync(`git rev-parse --abbrev-ref ${ref}`, { encoding: 'utf-8' }).trim();
}

module.exports = {
  detectDiff,
  getCurrentBranch,
};
