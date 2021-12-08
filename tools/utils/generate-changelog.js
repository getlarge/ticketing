const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// produce changelog to be piped to `gh release -F-`
// test with :
// node tools/utils/generate-changelog.js -s "1.0.0" | node -e "const fs = require('fs'); const stdinBuffer = fs.readFileSync(0); console.log(stdinBuffer.toString())"

const changelogFileNames = ['CHANGELOG.md', 'Changelog.md', 'changelog.md'];

// read root package.json
const getPackageJson = () => {
  try {
    return require(process.cwd() + '/package.json');
  } catch (e) {
    throw `No package.json found in ${process.cwd()}`;
  }
};

const getChangelogPath = () => {
  let value;
  for (const fileName of changelogFileNames) {
    if (fs.existsSync(path.resolve(fileName))) {
      value = fileName;
      break;
    }
  }
  return value;
};

// read root changelog
const getChangelog = ({ filename }) => {
  try {
    return fs.readFileSync(path.resolve(process.cwd(), filename), {
      encoding: 'utf8',
    });
  } catch (e) {
    throw `No ${filename} found in ${process.cwd()}`;
  }
};

// Look for the tag in either X.Y.Z or vX.Y.X formats
const getTagName = (semver) => {
  const tags = execSync('git tag', { encoding: 'utf8' });
  const tagMatches = tags.match(new RegExp(`^(v?)${semver}$`, 'gm'));
  if (!tagMatches) {
    throw new Error(`Tag ${semver} or v${semver} not found`);
  }
  return tagMatches[0];
};

// changelog
function extractFromChangelog({ verbose, semver }, changelog) {
  // accept various ways to specify version starting like
  // # 1.0
  // ## v1.0
  // ## [v1.0
  const versionStartStringRe = '^##? \\[?v?';
  const versionStartRe = new RegExp(versionStartStringRe);
  const versionRe = new RegExp(versionStartStringRe + semver.replace(/\./, '.'));
  const footerLinkRe = new RegExp('^\\[');

  let start = false;
  const changelogLines = changelog.replace(/\r\n/g, '\n').split('\n');

  return changelogLines
    .filter((line) => {
      verbose && console.log('MATCH', line.match(versionRe));
      if (!start && line.match(versionRe)) {
        verbose && console.log('START');
        start = true;
      } else if (start && (line.match(versionStartRe) || line.match(footerLinkRe))) {
        verbose && console.log('END');
        start = false;
      } else if (start) {
        verbose && console.log(line);
        // between start & end, collect lines
        return true;
      }
      verbose && console.log('IGNORED ' + line);
      return false;
    })
    .join('\n')
    .trim();
}

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [--filename CHANGELOG.md] [--semver 1.5.0]')
  .options({
    filename: {
      description: 'Full Changelog path',
      demandOption: false,
      alias: 'f',
      coerce: (value) => value || getChangelogPath(),
    },
    semver: {
      description: 'Version to extract from changelog',
      demandOption: false,
      alias: 's',
      coerce: (value) => value || getPackageJson().version,
    },
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  }).argv;

(function () {
  try {
    const changelog = getChangelog(argv);
    const versionChangelog = extractFromChangelog(argv, changelog);
    console.log(versionChangelog);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
