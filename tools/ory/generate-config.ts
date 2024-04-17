import yargs from 'yargs';
import {
  generateOryKratosConfig,
  generateOryKetoConfig,
  generateOryOathkeeperConfig,
  generateOryHydraConfig,
} from './helpers';

interface BaseOptions {
  envFile?: string;
}

async function main() {
  await yargs(process.argv.slice(2))
    .options({
      envFile: {
        description: 'Path to .env file',
        demandOption: false,
        example: 'infra/ory/kratos/.env',
        alias: 'e',
        type: 'string',
      },
    })
    .command({
      command: 'kratos',
      describe: 'Command to generate Kratos config from template',
      handler: (
        argv: yargs.ArgumentsCamelCase<
          BaseOptions & {
            _: ['kratos'];
          }
        >,
      ) => {
        const { envFile } = argv;
        generateOryKratosConfig(envFile);
      },
    })
    .command({
      command: 'hydra',
      describe: 'Command to generate Hydra config from template',
      handler: (
        argv: yargs.ArgumentsCamelCase<
          BaseOptions & {
            _: ['hydra'];
          }
        >,
      ) => {
        const { envFile } = argv;
        generateOryHydraConfig(envFile);
      },
    })
    .command({
      command: 'keto',
      describe: 'Command to generate Keto config from template',
      handler: (
        argv: yargs.ArgumentsCamelCase<
          BaseOptions & {
            _: ['keto'];
          }
        >,
      ) => {
        const { envFile } = argv;
        generateOryKetoConfig(envFile);
      },
    })
    .command({
      command: 'oathkeeper',
      describe: 'Command to generate Oathkeeper config from template',
      handler: (
        argv: yargs.ArgumentsCamelCase<
          BaseOptions & {
            _: ['oathkeeper'];
          }
        >,
      ) => {
        const { envFile } = argv;
        generateOryOathkeeperConfig(envFile);
      },
    })
    .demandCommand(1, 'A valid command must be provided')
    .fail((msg, err) => {
      if (err) throw err;
      throw new Error(msg);
    }).argv;
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
