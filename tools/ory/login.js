const axios = require('axios');
const { isEmail } = require('class-validator');
const readline = require('node:readline');
const { inspect } = require('node:util');

const axiosInstance = axios.create({
  baseURL: process.env.ORY_BASE_PATH,
});

async function initLoginFlow() {
  const url = `/self-service/login/api`;
  const response = await axiosInstance.get(url, { responseType: 'json' });
  return {
    flowId: response.data.id,
    flowUrl: response.data.ui.action,
    setCookie: response.headers['set-cookie'],
  };
}

async function completeLoginFlow(
  { flowId, flowUrl },
  { identifier, password },
) {
  const response = await axiosInstance.post(
    // `/self-service/login/flow=${flowId}`,
    flowUrl,
    {
      identifier,
      password,
      method: 'password',
    },
    {
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
    },
  );
  console.log(
    inspect(response.data, {
      depth: 10,
      colors: true,
    }),
  );
  return response.data.session_token;
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

async function login({ identifier, password }) {
  console.log('init login flow');
  const { flowId, flowUrl } = await initLoginFlow();
  console.log('complete login flow');
  const sessionToken = await completeLoginFlow(
    { flowId, flowUrl },
    {
      identifier,
      password,
    },
  );
  console.log('checking session token : ', sessionToken);
  const session = await checkSession(sessionToken);
  console.log('loggedin!', session);
}

async function main() {
  if (!process.env.ORY_BASE_PATH) {
    throw new TypeError(
      'ORY_BASE_PATH must be set in the environment variables',
    );
  }
  const identifier = process.env.ORY_USER ?? process.argv[2];
  if (!isEmail(identifier)) {
    throw new TypeError('Identifier must be an email address');
  }

  const password = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Password: ', (answer) => {
      resolve(answer);
      rl.close();
    });
  });
  if (!password) {
    throw new TypeError('Password must be a non-empty string');
  }
  await login({
    identifier,
    password,
  });
}

main().catch((e) =>
  console.error(
    e?.response?.data
      ? inspect(e.response.data, {
          depth: 10,
          colors: true,
        })
      : e.message,
  ),
);
