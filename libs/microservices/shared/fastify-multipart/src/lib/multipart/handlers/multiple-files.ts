import { BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { from } from 'rxjs';

import type { Storage, StorageFile } from '../../storage';
import { removeStorageFiles } from '../file';
import { filterUpload } from '../filter';
import type { TransformedUploadOptions } from '../options';
import { getParts } from '../request';
import { HandlerResponse } from './types';

export const handleMultipartMultipleFiles = async <
  S extends Storage extends Storage<infer U>
    ? Storage<U>
    : Storage<StorageFile>,
  T extends S extends Storage<infer U>
    ? U
    : StorageFile = S extends Storage<infer U>
    ? U
    : StorageFile
>(
  req: FastifyRequest,
  fieldname: string,
  maxCount: number,
  options: TransformedUploadOptions<S>,
): Promise<HandlerResponse & { files: T[] }> => {
  const parts = getParts<S>(req, options);
  const body: Record<string, unknown> = {};
  const files: T[] = [];

  const removeFiles = async (error?: boolean): Promise<void> => {
    await removeStorageFiles<S>(options.storage, files, error);
  };

  try {
    for await (const part of parts) {
      if (part.file) {
        if (part.fieldname !== fieldname) {
          throw new BadRequestException(
            `Field ${part.fieldname} doesn't accept files`,
          );
        }

        if (files.length + 1 > maxCount) {
          throw new BadRequestException(
            `Field ${part.fieldname} accepts max ${maxCount} files`,
          );
        }

        const file = (await options.storage.handleFile(part, req)) as T;

        if (await filterUpload(options, req, file)) {
          files.push(file);
        }
      } else {
        body[part.fieldname] = part.value;
      }
    }
  } catch (error) {
    await removeFiles(!!error);
    throw error;
  }

  return { body, files, remove: () => from(removeFiles()) };
};
