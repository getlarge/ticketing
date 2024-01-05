const { isEmail } = require('class-validator');
const { inspect } = require('node:util');
const { axiosInstance } = require('./utils');

async function initVerificationFlow() {
  const url = `/self-service/verification/api`;
  const response = await axiosInstance.get(url, { responseType: 'json' });
  console.log(
    inspect(response.data, {
      depth: 10,
      colors: true,
    }),
  );
  return {
    flowId: response.data.id,
    flowUrl: response.data.ui.action,
  };
}

// TODO: if `code` provided allow completion via /self-service/verification?code=<code>&flow=<flowId>>
async function completeVerificationFlow({ flowId, flowUrl }, { email }) {
  const response = await axiosInstance.post(
    // `/self-service/verification/flow=${flowId}`,
    flowUrl,
    {
      email,
      // method: 'link',
      method: 'code',
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
  return response.data;
}

async function verify({ email }) {
  console.log('init verification flow');
  const { flowId, flowUrl } = await initVerificationFlow();
  console.log('complete verification flow');
  await completeVerificationFlow({ flowId, flowUrl }, { email });
  console.log('Verification email sent');
}

async function main() {
  const email = process.env.ORY_USER ?? process.argv[2];
  if (!isEmail(email)) {
    throw new TypeError('Identifier must be an email address');
  }

  await verify({
    email,
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
