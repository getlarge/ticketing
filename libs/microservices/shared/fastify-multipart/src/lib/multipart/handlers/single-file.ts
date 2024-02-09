import { BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { from } from 'rxjs';

import type { MultipartFile, Storage, StorageFile } from '../../storage';
import { filterUpload } from '../filter';
import type { TransformedUploadOptions } from '../options';
import { getParts } from '../request';
import { HandlerResponse } from './types';

export const handleMultipartSingleFile = async <
  S extends Storage extends Storage<infer U>
    ? Storage<U>
    : Storage<StorageFile>,
  F extends S extends Storage<infer U> ? U : StorageFile,
>(
  req: FastifyRequest,
  fieldname: string,
  options: TransformedUploadOptions<S>,
): Promise<HandlerResponse & { file: F | undefined }> => {
  const parts = getParts<S>(req, options);
  const body: Record<string, unknown> = {};
  let file: F | undefined = undefined;

  const removeFiles = async (error?: boolean): Promise<void> => {
    if (file == null) return;
    await options.storage.removeFile(file, error);
  };

  try {
    const { value: part }: { value: MultipartFile } = await parts.next();
    if (part.file) {
      if (part.fieldname !== fieldname) {
        throw new BadRequestException(
          `Field ${part.fieldname} doesn't accept file`,
        );
      } else if (file != null) {
        throw new BadRequestException(
          `Field ${fieldname} accepts only one file`,
        );
      }

      const _file = (await options.storage.handleFile(part, req)) as F;
      if (await filterUpload(options, req, _file)) {
        file = _file;
      }
    } else {
      body[part.fieldname] = part.value;
    }
  } catch (error) {
    await removeFiles(true);
    throw error;
  }

  return {
    body,
    file,
    remove: () => from(removeFiles()),
  };
};
