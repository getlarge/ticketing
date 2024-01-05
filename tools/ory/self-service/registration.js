const { isEmail } = require('class-validator');
const { inspect } = require('node:util');
const { askPassword, axiosInstance, checkSession } = require('./utils');

async function initRegistrationFlow() {
  const url = `/self-service/registration/api`;
  const response = await axiosInstance.get(url, { responseType: 'json' });
  return {
    flowId: response.data.id,
    flowUrl: response.data.ui.action,
    setCookie: response.headers['set-cookie'],
  };
}

async function completeRegistrationFlow(
  { flowId, flowUrl },
  { email, password },
) {
  const response = await axiosInstance.post(
    // `/self-service/registration/flow=${flowId}`,
    flowUrl,
    {
      traits: { email },
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

async function register({ email, password }) {
  console.log('init registration flow');
  const { flowId, flowUrl } = await initRegistrationFlow();
  console.log('complete registration flow');
  const body = await completeRegistrationFlow(
    { flowId, flowUrl },
    {
      email,
      password,
    },
  );
  console.log('Registration completed');
  console.log(
    inspect(body, {
      depth: 10,
      colors: true,
    }),
  );
}

async function main() {
  const email = process.env.ORY_USER ?? process.argv[2];
  if (!isEmail(email)) {
    throw new TypeError('Identifier must be an email address');
  }

  const password = await askPassword();
  await register({
    email,
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
