const { execSync } = require('child_process');
const fs = require('fs');
const glob = require('glob');
const { set } = require('lodash');
const prettier = require('prettier');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { version } = require('../../package.json');

const config = [
  {
    pattern: 'apps/*/package.json',
    propertyPath: 'version',
  },
  {
    // pattern: 'apps/*/{openapi,asyncapi}.json',
    pattern: 'apps/*/openapi.json',
    propertyPath: 'info.version',
  },
];

function syncJsonFiles(filePattern, propertyPath) {
  const filePaths = glob.sync(filePattern);
  filePaths.forEach((filePath) => {
    const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    set(file, propertyPath, version);
    const result = prettier.format(JSON.stringify(file, null, 2), {
      parser: 'json',
    });
    fs.writeFileSync(filePath, result);
  });
}

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [--filename CHANGELOG.md] [--semver 1.5.0]')
  .options({
    dryRun: {
      description: 'Wether to stage changed files',
      type: 'boolean',
      alias: 'd',
    },
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  }).argv;

(function () {
  const { dryRun } = argv;
  try {
    config.forEach(({ pattern, propertyPath }) => {
      syncJsonFiles(pattern, propertyPath);
      if (!dryRun) {
        execSync(`git add ${pattern}`);
      }
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
