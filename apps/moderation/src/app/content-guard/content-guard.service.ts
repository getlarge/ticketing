import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';

import { ContentGuardModuleOptions } from './content-guard.interfaces';

export interface IOpenAIModerationResponse {
  id: `modr-${string}`;
  model: `text-moderation-${string}`;
  results: {
    flagged: boolean;
    categories: {
      sexual: boolean;
      hate: boolean;
      harassment: boolean;
      'self-harm': boolean;
      'sexual/minors': boolean;
      'hate/threatening': boolean;
      'violence/graphic': boolean;
      'self-harm/intent': boolean;
      'self-harm/instructions': boolean;
      'harassment/threatening': boolean;
      violence: boolean;
    };
    category_scores: {
      sexual: number;
      hate: number;
      harassment: number;
      'self-harm': number;
      'sexual/minors': number;
      'hate/threatening': number;
      'violence/graphic': number;
      'self-harm/intent': number;
      'self-harm/instructions': number;
      'harassment/threatening': number;
      violence: number;
    };
  }[];
}

@Injectable()
export class ContentGuardService implements OnModuleInit {
  constructor(
    @Inject(ContentGuardModuleOptions)
    private readonly options: ContentGuardModuleOptions,
    private readonly httpService: HttpService,
  ) {}

  private get openAIApiKey(): string {
    return this.options.openAIApiKey;
  }

  private get dictionary(): ContentGuardModuleOptions['dictionary'] {
    return this.options.dictionary;
  }

  private set dictionary(dictionary: ContentGuardModuleOptions['dictionary']) {
    this.options.dictionary = dictionary;
  }

  async onModuleInit(): Promise<void> {
    if (!this.dictionary) {
      // TODO: cache this to avoid hitting the API every time
      this.dictionary = {};
      this.dictionary.en = await firstValueFrom(
        this.httpService
          .get<string>(
            'https://raw.githubusercontent.com/chucknorris-io/swear-words/master/en',
          )
          .pipe(map((response) => response.data.trim().split('\n'))),
      );
    }
  }

  matchesDictionary(input: string, language: string = 'en'): boolean {
    return (
      this.dictionary[language].filter((word) => {
        const wordExp = new RegExp(
          `\\b${word.replace(/(\W)/g, '\\$1')}\\b`,
          'gi',
        );
        return wordExp.test(input);
      }).length > 0 || false
    );
  }

  isFlagged(
    input: string,
    model:
      | 'text-moderation-stable'
      | 'text-moderation-latest' = 'text-moderation-stable',
  ): Promise<IOpenAIModerationResponse['results'][0]> {
    return firstValueFrom(
      this.httpService
        .post<IOpenAIModerationResponse>(
          'https://api.openai.com/v1/moderations',
          {
            input,
            model,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.openAIApiKey}`,
            },
          },
        )
        .pipe(map((response) => response.data.results[0])),
    );
  }
}
