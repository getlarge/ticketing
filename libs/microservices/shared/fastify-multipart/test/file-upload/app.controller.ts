import {
  Controller,
  Post,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { join } from 'node:path';

import {
  AnyFilesInterceptor,
  DiskStorage,
  DiskStorageFile,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
  MemoryStorage,
  MemoryStorageFile,
  StreamStorage,
  StreamStorageFile,
  UploadedFile,
  UploadedFiles,
} from '../../src';

@Controller()
export class AppController {
  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: new MemoryStorage(),
    }),
  )
  uploadSingleFile(@UploadedFile() file: MemoryStorageFile): {
    success: boolean;
  } {
    return { success: !!file };
  }

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('file', 10, { storage: new MemoryStorage() }),
  )
  uploadMultipleFiles(@UploadedFiles() files: MemoryStorageFile[]): {
    success: boolean;
    fileCount: number;
  } {
    return { success: !!files.length, fileCount: files.length };
  }

  @Post('any')
  @UseInterceptors(AnyFilesInterceptor({ storage: new MemoryStorage() }))
  uploadAnyFiles(@UploadedFiles() files: MemoryStorageFile[]): {
    success: boolean;
    fileCount: number;
  } {
    return { success: !!files.length, fileCount: files.length };
  }

  @Post('fields')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profile' }, { name: 'avatar' }], {
      storage: new MemoryStorage(),
    }),
  )
  uploadFileFieldsFiles(
    @UploadedFiles()
    files: {
      profile?: MemoryStorageFile[];
      avatar?: MemoryStorageFile[];
    },
  ): { success: boolean; fileCount: number } {
    return {
      success: !!((files.profile?.length ?? 0) + (files.avatar?.length ?? 0)),
      fileCount: (files.profile?.length ?? 0) + (files.avatar?.length ?? 0),
    };
  }

  @Post('single-stream')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: new StreamStorage(),
    }),
  )
  streamSingleFile(@UploadedFile() file: StreamStorageFile): StreamableFile {
    return new StreamableFile(file.stream);
  }

  @Post('single-disk')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: new DiskStorage({
        removeAfter: true,
      }),
      dest: join(process.cwd(), 'uploads'),
    }),
  )
  persistSingleFile(@UploadedFile() file: DiskStorageFile): {
    success: boolean;
    filepath: string;
  } {
    return { success: !!file, filepath: file.path };
  }
}
