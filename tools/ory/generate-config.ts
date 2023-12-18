import yargs from 'yargs';
import { generateOryKratosConfig } from './helpers';

interface BaseOptions {
  envFile?: string;
  configFile?: string;
  outputFile?: string;
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
      configFile: {
        description: 'Path to template config file',
        demandOption: false,
        example: 'infra/ory/kratos/config.yaml',
        alias: 'c',
        type: 'string',
      },
      outputFile: {
        description: 'Export file path',
        demandOption: false,
        example: 'infra/ory/kratos/kratos.yaml',
        alias: 'o',
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
        const { configFile, envFile, outputFile } = argv;
        generateOryKratosConfig(envFile, configFile, outputFile);
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
      ) => {},
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
