import { Controller, Post, UseInterceptors } from '@nestjs/common';

import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
  MemoryStorage,
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
  uploadSingleFile(@UploadedFile() file: unknown): { success: boolean } {
    return { success: !!file };
  }

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('file', 10, { storage: new MemoryStorage() }),
  )
  uploadMultipleFiles(@UploadedFiles() files: unknown[]): {
    success: boolean;
    fileCount: number;
  } {
    return { success: !!files.length, fileCount: files.length };
  }

  @Post('any')
  @UseInterceptors(AnyFilesInterceptor({ storage: new MemoryStorage() }))
  uploadAnyFiles(@UploadedFiles() files: unknown[]): {
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
    @UploadedFiles() files: { profile?: unknown[]; avatar?: unknown[] },
  ): { success: boolean; fileCount: number } {
    return {
      success: !!((files.profile?.length ?? 0) + (files.avatar?.length ?? 0)),
      fileCount: (files.profile?.length ?? 0) + (files.avatar?.length ?? 0),
    };
  }
}
