import type { MultipartFile as _MultipartFile } from '@fastify/multipart';
import type { FastifyRequest } from 'fastify';
import type { Readable } from 'node:stream';

export interface StorageFile {
  size: number;
  fieldname: string;
  encoding: string;
  mimetype: string;
  originalFilename: string;
}

export type MultipartFile = Omit<_MultipartFile, 'file'> & {
  value?: unknown;
  file: Readable & { truncated?: boolean; bytesRead?: number };
};

export abstract class Storage<
  T extends StorageFile = StorageFile,
  K = unknown,
> {
  abstract handleFile(file: MultipartFile, req?: FastifyRequest): Promise<T>;
  abstract removeFile(file: T, force?: boolean): Promise<void> | void;
  options?: K;
}
