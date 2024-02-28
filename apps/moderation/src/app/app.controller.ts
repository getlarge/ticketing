import {
  BeforeApplicationShutdown,
  Controller,
  Get,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController
  implements
    OnModuleDestroy,
    OnModuleInit,
    OnApplicationBootstrap,
    OnApplicationShutdown,
    BeforeApplicationShutdown
{
  readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  onModuleInit(): void {
    this.logger.log(`initialized`);
  }

  onApplicationBootstrap(): void {
    this.logger.log(`bootstraped`);
  }

  onModuleDestroy(): void {
    this.logger.log(`destroyed`);
  }

  beforeApplicationShutdown(signal?: string): void {
    this.logger.log(`before shutdown ${signal}`);
  }

  onApplicationShutdown(signal?: string): void {
    this.logger.log(`shutdown ${signal}`);
  }

  @Get()
  getData(): { message: string } {
    return this.appService.getData();
  }
}
