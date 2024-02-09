import type { FastifyRequest } from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';
import { randomBytes } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, stat, unlink } from 'node:fs/promises';
import { IncomingMessage, Server } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { promisify } from 'node:util';

import { type MultipartFile, type StorageFile, Storage } from './storage';

export interface DiskStorageFile extends StorageFile {
  dest: string;
  filename: string;
  path: string;
}

type DiskStorageOptionHandler =
  | ((file: MultipartFile, req: FastifyRequest) => Promise<string> | string)
  | string;

export interface DiskStorageOptions {
  dest?: DiskStorageOptionHandler;
  filename?: DiskStorageOptionHandler;
  removeAfter?: boolean;
}

const excecuteStorageHandler = (
  file: MultipartFile,
  req: FastifyRequest,
  obj?: DiskStorageOptionHandler,
): string | Promise<string> | null => {
  if (typeof obj === 'function') {
    return obj(file, req);
  }

  if (obj != null) {
    return obj;
  }
  return null;
};

const pathExists = async (path: string): Promise<boolean> => {
  try {
    await stat(path);
  } catch (err) {
    return false;
  }

  return true;
};

const getUniqueFilename = async (filename: string): Promise<string> => {
  const buffer = await promisify(randomBytes)(16);
  const ext = extname(filename);
  return buffer.toString('hex') + ext;
};

const ENV_TESTS_STORAGE_TMP_PATH = process.env['__TESTS_TMP_PATH__'];

export class DiskStorage extends Storage<DiskStorageFile, DiskStorageOptions> {
  override readonly options?: DiskStorageOptions;

  constructor(options?: DiskStorageOptions) {
    super();
    this.options = options;

    if (ENV_TESTS_STORAGE_TMP_PATH != null) {
      this.options = { ...this.options, dest: ENV_TESTS_STORAGE_TMP_PATH };
    }
  }

  async handleFile(
    file: MultipartFile,
    req: FastifyRequest<RouteGenericInterface, Server, IncomingMessage>,
  ): Promise<DiskStorageFile> {
    const filename = await this.getFilename(file, req, this.options?.filename);
    const dest = await this.getFileDestination(file, req, this.options?.dest);

    if (!(await pathExists(dest))) {
      await mkdir(dest, { recursive: true });
    }

    const path = join(dest, filename);
    const stream = createWriteStream(path);
    await pipeline(file.file, stream);

    const { encoding, fieldname, mimetype } = file;

    return {
      size: stream.bytesWritten,
      dest,
      filename,
      originalFilename: file.filename,
      path,
      mimetype,
      encoding,
      fieldname,
    };
  }

  async removeFile(file: DiskStorageFile, force?: boolean): Promise<void> {
    if (!this.options?.removeAfter && !force) return;
    await unlink(file.path);
  }

  protected getFilename(
    file: MultipartFile,
    req: FastifyRequest,
    obj?: DiskStorageOptionHandler,
  ): Promise<string> | string {
    return (
      excecuteStorageHandler(file, req, obj) ?? getUniqueFilename(file.filename)
    );
  }

  protected getFileDestination(
    file: MultipartFile,
    req: FastifyRequest,
    obj?: DiskStorageOptionHandler,
  ): Promise<string> | string {
    return excecuteStorageHandler(file, req, obj) ?? tmpdir();
  }
}
