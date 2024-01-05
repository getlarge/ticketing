const axios = require('axios');
const readline = require('node:readline');

const axiosInstance = axios.create({
  baseURL: process.env.ORY_BASE_PATH || 'http://localhost:4433',
});

async function askPassword() {
  const password = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.stdoutMuted = true;
    rl.question('Password: ', (answer) => {
      resolve(answer);
      rl.close();
    });
    rl._writeToOutput = function (stringToWrite) {
      if (rl.stdoutMuted) {
        rl.output.write('*');
      } else {
        rl.output.write(stringToWrite);
      }
    };
  });
  if (!password) {
    throw new TypeError('Password must be a non-empty string');
  }
  return password;
}

function checkSession(sessionToken) {
  return axiosInstance
    .get(`/sessions/whoami`, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${sessionToken}`,
      },
    })
    .then(({ data }) => data);
}

module.exports = {
  askPassword,
  axiosInstance,
  checkSession,
};
