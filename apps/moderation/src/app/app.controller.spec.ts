import { Test, TestingModule } from '@nestjs/testing';
import { AsyncLocalStorageService } from '@ticketing/microservices/shared/async-local-storage';
import { AsyncLocalStorage } from 'async_hooks';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          useValue: AsyncLocalStorage,
          provide: 'ASYNC_LOCAL_STORAGE',
        },
        AsyncLocalStorageService,
      ],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Welcome to moderation!"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getData()).toEqual({
        message: 'Welcome to moderation!',
      });
    });
  });
});
