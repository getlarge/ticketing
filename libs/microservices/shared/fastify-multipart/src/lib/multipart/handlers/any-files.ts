import type { FastifyRequest } from 'fastify';
import { from } from 'rxjs';

import type { Storage, StorageFile } from '../../storage';
import { removeStorageFiles } from '../file';
import { filterUpload } from '../filter';
import type { TransformedUploadOptions } from '../options';
import { getParts } from '../request';
import { HandlerResponse } from './types';

export const handleMultipartAnyFiles = async <
  S extends Storage
>(
  req: FastifyRequest,
  options: TransformedUploadOptions<S>,
): Promise<HandlerResponse & { files: StorageFile[] }> => {
  const parts = getParts<S>(req, options);
  const body: Record<string, unknown> = {};
  const files: StorageFile[] = [];

  const removeFiles = async (error?: boolean): Promise<void> => {
    await removeStorageFiles(options.storage, files, error);
  };

  try {
    for await (const part of parts) {
      if (part.file) {
        const file = await options.storage.handleFile(part, req);
        if (await filterUpload(options, req, file)) {
          files.push(file);
        }
      } else {
        body[part.fieldname] = part.value;
      }
    }
  } catch (error) {
    await removeFiles(true);
    throw error;
  }

  return { body, files, remove: () => from(removeFiles()) };
};
