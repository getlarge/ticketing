const { isEmail } = require('class-validator');
const { inspect } = require('node:util');
const { askPassword, axiosInstance, checkSession } = require('./utils');

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
  return response.data;
}

async function login({ identifier, password }) {
  console.log('init login flow');
  const { flowId, flowUrl } = await initLoginFlow();
  console.log('complete login flow');
  const { session_token: sessionToken } = await completeLoginFlow(
    { flowId, flowUrl },
    {
      identifier,
      password,
    },
  );
  console.log('checking session token : ', sessionToken);
  const session = await checkSession(sessionToken);
  console.log('User loggedin');
  console.log(
    inspect(session, {
      depth: 10,
      colors: true,
    }),
  );
}

async function main() {
  const identifier = process.env.ORY_USER ?? process.argv[2];
  if (!isEmail(identifier)) {
    throw new TypeError('Identifier must be an email address');
  }

  const password = await askPassword();
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
