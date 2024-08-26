import { HttpException } from '@nestjs/common';

export type OryWebhookErrorMessages = {
  instance_ptr: string;
  messages: {
    id: number;
    text: string;
    type: string;
    context: {
      value: string;
    };
  }[];
};

export class OryWebhookError extends HttpException {
  constructor(
    message: string,
    public readonly messages: OryWebhookErrorMessages[],
    status: number,
  ) {
    super(OryWebhookError.toJSON(messages, status), status);
    this.name = 'OryWebhookError';
    this.message = message;
    Error.captureStackTrace(this, OryWebhookError);
  }

  static toJSON(
    messages: OryWebhookErrorMessages[],
    statusCode: number,
  ): {
    statusCode: number;
    messages: OryWebhookErrorMessages[];
  } {
    return {
      statusCode,
      messages,
    };
  }
}
