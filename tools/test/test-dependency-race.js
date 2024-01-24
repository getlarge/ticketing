const { exec } = require('node:child_process');
const { assert } = require('node:console');
const { join } = require('node:path');
const { once } = require('node:stream');
const { readFile, writeFile } = require('node:fs').promises;

const moderationAppServiceTsPath = join(
  __dirname,
  '..',
  '..',
  'apps',
  'moderation',
  'src',
  'app',
  'app.service.ts',
);
let counter = 0;
let isOriginalApi = true;

function runE2ETests() {
  const shouldFail = !isOriginalApi;
  console.warn(
    '➡️ running E2E tests',
    shouldFail ? 'should fail' : 'should pass',
  );
  const moderationE2EProcess = exec('npx nx run moderation-e2e:e2e');
  moderationE2EProcess.stdout.pipe(process.stdout);
  moderationE2EProcess.stderr.pipe(process.stderr);
  once(moderationE2EProcess, 'exit').then(([code, signal]) => {
    console.warn('🏁 test finished', code, signal);
    assert(
      shouldFail ? code !== 0 : code === 0,
      `e2e tests should ${shouldFail ? 'fail' : 'pass'}`,
    );
  });
}

async function updateAppService() {
  const data = await readFile(moderationAppServiceTsPath, 'utf8');
  /**
   * Hello Moderation API is what should be returned by the API and what the e2e tests expect
   */
  const index = data.search('Hello Moderation API');
  let updatedData = '';
  if (index > 0) {
    // in that case e2e tests will fail
    updatedData = data.replaceAll('Hello Moderation API', 'Hello World!');
    isOriginalApi = false;
  } else {
    // in that case e2e tests will pass
    updatedData = data.replaceAll('Hello World!', 'Hello Moderation API');
    isOriginalApi = true;
  }

  console.warn('🎬 updating API to ', isOriginalApi ? 'original' : 'new');
  /**
   * You can try running the e2e tests here, after the write operation is started or after the file is written
   * the outcome should be the same:
   * - e2e tests will fail when the API is updated and only the build cache is used
   * - e2e tests will pass when the API is restored using cache for both the moderation:build and moderation-e2e:e2e tasks
   * An exception might occur occasionally when the e2e tests are running before the app listens on the port 3090
   *
   **/
  runE2ETests();

  /**
   * should trigger build and reload of moderation app
   **/
  writeFile(moderationAppServiceTsPath, updatedData).then(() => {
    counter++;
    console.warn('➡️ updated API ', counter);
    // runE2ETests();
  });

  // runE2ETests();
}

/**
 * This script run an application (HTTP API), which is hot reloading after a file change - npx nx run moderation:serve -
 * and, in parallel, pseudo randomly trigger e2e tests against this application - npx nx run moderation-e2e:e2e
 * Both tasks should read to and write from the same cache.
 * The goal is to demonstrate that it is possible to ensure that the e2e tests are always running against the
 * latest version of the application.
 **/

function main() {
  const moderationServerProcess = exec(
    'npx nx run moderation:serve --inspect=false',
  );
  // moderationServerProcess.stdout.pipe(process.stdout);
  moderationServerProcess.stderr.pipe(process.stderr);
  once(moderationServerProcess, 'exit').then(([code, signal]) =>
    console.log('moderationServerProcess exit', code, signal),
  );

  /**
   * update API every 3-7 seconds
   */
  setInterval(
    () => {
      updateAppService();
    },
    (Math.floor(Math.random() * 4) + 3) * 1000,
  );
}

main();
