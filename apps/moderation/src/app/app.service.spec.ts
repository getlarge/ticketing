import { beforeAll, describe, expect, it } from '@jest/globals';
import { Test } from '@nestjs/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return "Hello Moderation API"', () => {
      expect(service.getData()).toEqual({ message: 'Hello Moderation API' });
    });
  });
});
