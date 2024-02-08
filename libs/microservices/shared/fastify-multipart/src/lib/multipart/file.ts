import type { Storage, StorageFile } from '../storage';

export const removeStorageFiles = async <
  S extends Storage<StorageFile> extends Storage<infer U>
    ? Storage<U>
    : Storage<StorageFile>,
  T extends StorageFile extends Storage<infer U> ? U : StorageFile = StorageFile extends Storage<infer U> ? U : StorageFile
>(
  storage: S,
  files?: (T | undefined)[],
  force?: boolean,
): Promise<void> => {
  if (files == null) return;
  await Promise.all(
    files.map((file) => file && storage.removeFile(file, force)),
  );
};
