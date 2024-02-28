import {
  BeforeApplicationShutdown,
  Controller,
  Get,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
  Param,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AsyncLocalStorageService } from '@ticketing/microservices/shared/async-local-storage';

import { AppService } from './app.service';
import { ControllerFilter } from './filters/controller.filter';
import { RouteFilter } from './filters/route.filter';
import { ControllerGuard } from './guards/controller.guard';
import { RouteGuard } from './guards/route.guard';
import { ControllerInterceptor } from './interceptors/controller.interceptor';
import { RouteInterceptor } from './interceptors/route.interceptor';
import { ControllerPipe } from './pipes/controller.pipe';
import { RoutePipe } from './pipes/route.pipe';
import { RouteParamsPipe } from './pipes/route-params.pipe';

@Controller()
@UseGuards(ControllerGuard)
@UseInterceptors(ControllerInterceptor)
@UsePipes(ControllerPipe)
@UseFilters(ControllerFilter)
export class AppController
  implements
    OnModuleDestroy,
    OnModuleInit,
    OnApplicationBootstrap,
    OnApplicationShutdown,
    BeforeApplicationShutdown
{
  readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly asyncLocalStorageService: AsyncLocalStorageService,
  ) {}

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
  @UseGuards(RouteGuard)
  @UseInterceptors(RouteInterceptor)
  @UsePipes(RoutePipe)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getData(@Param('id', RouteParamsPipe) _id?: string): { message: string } {
    return this.appService.getData();
  }

  @Get('exception')
  @UseGuards(RouteGuard)
  @UseInterceptors(RouteInterceptor)
  @UsePipes(RoutePipe)
  @UseFilters(RouteFilter)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getException(@Param('id', RouteParamsPipe) _id?: string): string {
    throw new Error('Exception');
  }

  @Get('request-context')
  getRequestContext(): unknown {
    return this.asyncLocalStorageService.get('REQUEST_CONTEXT');
  }
}
