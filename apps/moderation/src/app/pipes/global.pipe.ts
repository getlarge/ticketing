import {
  ArgumentMetadata,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class GlobalPipe<T, R> implements PipeTransform<T, R> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: T, _metadata: ArgumentMetadata): R {
    Logger.log('Global pipe');
    return value as unknown as R;
  }
}
