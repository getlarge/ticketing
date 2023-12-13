import { RmqContext } from '@nestjs/microservices';
import type {
  Channel,
  Connection,
  Message,
  MessageFields,
  MessageProperties,
} from 'amqplib';
import EventEmitter from 'node:events';
import { of } from 'rxjs';

export class MockClient {
  public send = jest.fn().mockReturnValue(of({}));
  public emit = jest.fn().mockReturnValue(of({}));
  public close = jest.fn();
}
export class RmqMessage implements Message {
  content: Buffer;
  fields: MessageFields;
  properties: MessageProperties;
  constructor(
    content: Buffer = Buffer.from(''),
    fields: MessageFields = {
      deliveryTag: 0,
      redelivered: false,
      exchange: '',
      routingKey: '',
    },
    properties: MessageProperties = {
      contentType: 'application/json',
      contentEncoding: 'utf-8',
      headers: {},
      deliveryMode: 1,
      priority: 0,
      correlationId: undefined,
      replyTo: undefined,
      expiration: undefined,
      messageId: undefined,
      timestamp: undefined,
      type: undefined,
      userId: undefined,
      appId: undefined,
      clusterId: undefined,
    },
  ) {
    this.content = content;
    this.fields = fields;
    this.properties = properties;
  }
}

class RmqChannel extends EventEmitter implements Channel {
  constructor(connection?: Connection) {
    super();
    this.connection = connection;
  }
  connection: Connection;
  close = jest.fn();
  assertQueue = jest.fn();
  checkQueue = jest.fn();
  deleteQueue = jest.fn();
  purgeQueue = jest.fn();
  bindQueue = jest.fn();
  unbindQueue = jest.fn();
  assertExchange = jest.fn();
  checkExchange = jest.fn();
  deleteExchange = jest.fn();
  bindExchange = jest.fn();
  unbindExchange = jest.fn();
  publish = jest.fn();
  sendToQueue = jest.fn();
  consume = jest.fn();
  cancel = jest.fn();
  get = jest.fn();
  ack = jest.fn();
  ackAll = jest.fn();
  nack = jest.fn();
  nackAll = jest.fn();
  reject = jest.fn();
  prefetch = jest.fn();
  recover = jest.fn();
}

export function createRmqContext(
  content?: Buffer,
  pattern?: string,
): RmqContext {
  const message = new RmqMessage(content);
  const channel = new RmqChannel();
  return new RmqContext([message, channel, pattern]);
}

export class MockPublisher extends MockClient {
  onApplicationBootstrap = jest.fn();
  connect = jest.fn();
  close = jest.fn();
}
