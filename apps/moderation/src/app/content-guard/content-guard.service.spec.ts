/* eslint-disable max-nested-callbacks */
/* eslint-disable max-lines-per-function */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { HttpService } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';

import { ContentGuardModuleOptions } from './content-guard.interfaces';
import {
  ContentGuardService,
  IOpenAIModerationResponse,
} from './content-guard.service';

describe('ContentGuardService', () => {
  let service: ContentGuardService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ContentGuardService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: ContentGuardModuleOptions,
          useValue: {
            dictionary: { en: ['test'] },
            openAIApiKey: 'test-key',
          },
        },
      ],
    }).compile();

    service = module.get(ContentGuardService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('matchesDictionary', () => {
    it('when a value is present in the dictionary it should be a match', () => {
      expect(service.matchesDictionary('test')).toBe(true);
    });

    it('when a value is missing from the dictionary it should NOT be a match', () => {
      expect(service.matchesDictionary('no-match')).toBe(false);
    });
  });

  describe('isFlagged', () => {
    it('it should return first result from OpenAI API response', async () => {
      const mockResponse: IOpenAIModerationResponse = {
        id: 'modr-test',
        model: 'text-moderation-stable',
        results: [
          {
            flagged: true,
            categories: {
              sexual: false,
              hate: false,
              harassment: false,
              'self-harm': false,
              'sexual/minors': false,
              'hate/threatening': false,
              'violence/graphic': false,
              'self-harm/intent': false,
              'self-harm/instructions': false,
              'harassment/threatening': false,
              violence: false,
            },
            category_scores: {
              sexual: 0,
              hate: 0,
              harassment: 0,
              'self-harm': 0,
              'sexual/minors': 0,
              'hate/threatening': 0,
              'violence/graphic': 0,
              'self-harm/intent': 0,
              'self-harm/instructions': 0,
              'harassment/threatening': 0,
              violence: 0,
            },
          },
        ],
      };

      jest.spyOn(httpService, 'post').mockImplementationOnce(() =>
        of({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as AxiosResponse<IOpenAIModerationResponse>),
      );
      const input = 'test-content';

      const result = await service.isFlagged(input);
      expect(result).toEqual(mockResponse.results[0]);
      expect(httpService.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/moderations',
        {
          model: 'text-moderation-stable',
          input,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: expect.any(String),
          },
        },
      );
    });
  });
});
