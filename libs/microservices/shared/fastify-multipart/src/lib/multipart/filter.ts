import { BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import type {
  DiskStorageFile,
  MemoryStorageFile,
  Storage,
  StorageFile,
  StreamStorageFile,
} from '../storage';
import type { UploadOptions } from './options';

export type UploadFilterFile =
  | DiskStorageFile
  | MemoryStorageFile
  | StreamStorageFile
  | StorageFile;

export type UploadFilterHandler = (
  req: FastifyRequest,
  file: UploadFilterFile,
) => Promise<boolean | string> | boolean | string;

export const filterUpload = async <S extends Storage>(
  uploadOptions: UploadOptions<S>,
  req: FastifyRequest,
  file: UploadFilterFile,
): Promise<boolean> => {
  if (!uploadOptions.filter) {
    return true;
  }

  try {
    const res = await uploadOptions.filter(req, file);
    if (typeof res === 'string') {
      throw new BadRequestException(res);
    }

    return res;
  } catch (error) {
    await uploadOptions.storage?.removeFile(file, true);
    throw error;
  }
};
