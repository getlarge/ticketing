import { BadRequestException } from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';
import type { FastifyRequest } from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';
import type { IncomingMessage, Server } from 'node:http';

import type { MultipartFile, Storage, StorageFile } from '../storage';
import type { UploadOptions } from './options';

export type FastifyMultipartRequest<F extends StorageFile = StorageFile> =
  FastifyRequest<RouteGenericInterface, Server, IncomingMessage> & {
    storageFile?: F;
    storageFiles?: F[] | Record<string, F[]>;
  };

export const getMultipartRequest = <F extends StorageFile = StorageFile>(
  ctx: HttpArgumentsHost,
): FastifyMultipartRequest<F> => {
  const req = ctx.getRequest<FastifyMultipartRequest<F>>();
  if (!req.isMultipart()) {
    throw new BadRequestException('Not a multipart request');
  }

  return req;
};

export const getParts = <S extends Storage>(
  req: FastifyRequest,
  options: UploadOptions<S>,
): MultipartsIterator => {
  return req.parts(options) as MultipartsIterator;
};

export type MultipartsIterator = AsyncIterableIterator<MultipartFile>;
