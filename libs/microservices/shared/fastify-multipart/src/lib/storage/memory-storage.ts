import { MultipartFile, Storage, StorageFile } from './storage';

export interface MemoryStorageFile extends StorageFile {
  buffer: Buffer;
}

export class MemoryStorage extends Storage<MemoryStorageFile> {
  async handleFile(file: MultipartFile): Promise<MemoryStorageFile> {
    const buffer = await file.toBuffer();
    const { encoding, mimetype, fieldname } = file;

    return {
      buffer,
      size: buffer.length,
      encoding,
      mimetype,
      fieldname,
      originalFilename: file.filename,
    };
  }

  removeFile(file: MemoryStorageFile): void {
    file.buffer = Buffer.from('');
  }
}
