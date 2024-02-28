import {
  ArgumentMetadata,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ControllerPipe<T, R> implements PipeTransform<T, R> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: T, _metadata: ArgumentMetadata): R {
    Logger.log('Controller pipe');
    return value as unknown as R;
  }
}
