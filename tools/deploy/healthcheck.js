/* eslint-disable @typescript-eslint/no-var-requires */
const http = require('http');

const callHealthEndpoint = (url) =>
  new Promise((resolve, reject) => {
    const request = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('close', () => {
        try {
          const parsedResponse = JSON.parse(data);
          if (res.statusCode !== 200) {
            reject(parsedResponse);
            return;
          }
          resolve(parsedResponse);
        } catch (e) {
          reject('Response was not a valid JSON');
        }
      });
    });

    request.on('error', (err) => {
      reject(err);
    });
  });

(async function (argv) {
  const url = argv[2] || `http://0.0.0.0:3000/health`;
  await callHealthEndpoint(url)
    .then((res) => {
      console.log(res);
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
})(process.argv);
