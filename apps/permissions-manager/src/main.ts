import { CommandFactory } from 'nest-commander';

import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  await CommandFactory.run(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    enablePositionalOptions: true,
    enablePassThroughOptions: true,
    cliName: 'permissions-manager',
    version: '0.0.1',
    usePlugins: true,
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
