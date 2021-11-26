import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { of } from 'rxjs';

export class MockClient {
  public send = jest.fn().mockReturnValue(of({}));
  public emit = jest.fn().mockReturnValue(of({}));
  public close = jest.fn();
}

export class NatsStreamingMessage {
  getSequence = jest.fn().mockReturnValueOnce(0);
  getSubject = jest.fn().mockReturnValueOnce('');
  getRawData = jest.fn().mockReturnValueOnce(Buffer.from(''));
  getData = jest.fn().mockReturnValueOnce('');
  getTimestampRaw = jest.fn().mockReturnValueOnce(1);
  getTimestamp = jest.fn().mockReturnValueOnce(1);
  isRedelivered = jest.fn().mockReturnValueOnce(false);
  getRedeliveryCount = jest.fn().mockReturnValueOnce(1);
  getCrc32 = jest.fn().mockReturnValueOnce(1313);
  // maybeAutoAck = jest.fn().mockReturnValueOnce(1)
  ack = jest.fn();
  getClientID = jest.fn().mockReturnValueOnce('');
  getConnectionID = jest.fn().mockReturnValueOnce('');
}

export function createNatsContext(): NatsStreamingContext {
  const message = new NatsStreamingMessage();
  return new NatsStreamingContext([message]);
}
