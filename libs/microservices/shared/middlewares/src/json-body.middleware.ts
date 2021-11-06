import { HttpException, Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json } from 'body-parser';
import { Request, Response } from 'express';

import { handleBodyParserErrors } from './helpers';

@Injectable()
export class JsonBodyMiddleware implements NestMiddleware {
  maxPayloadSize: number;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService
  ) {
    this.maxPayloadSize = this.configService.get('MAX_PAYLOAD_SIZE');
  }

  use(req: Request, res: Response, next: (error?: Error | HttpException) => unknown) {
    const limit = `${this.maxPayloadSize}mb`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json({ limit })(req, res, (err: any) => {
      handleBodyParserErrors(err, req, res, next);
    });
  }
}
