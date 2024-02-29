import { applyDecorators } from '@nestjs/common';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { decorate } from 'ts-mixer';

export const IsThresholdDecorator = (): PropertyDecorator => {
  return applyDecorators(
    Expose(),
    Type(() => Number),
    IsNumber(),
    Min(0),
    Max(1),
  );
};

export class ModerationEnvironmentVariables {
  @decorate(Expose())
  @decorate(IsString())
  OPENAI_API_KEY: string;

  @decorate(IsThresholdDecorator())
  MODERATION_HATE_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_HATE_THREATENING_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_HARASSMENT_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_HARASSMENT_THREATENING_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SELF_HARM_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SELF_HARM_INTENT_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SELF_HARM_INSTRUCTIONS_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SEXUAL_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SEXUAL_MINORS_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_VIOLENCE_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_VIOLENCE_GRAPHIC_THRESHOLD?: number = 0.7;

  @decorate(Expose())
  @decorate(
    IsUrl({
      require_tld: false,
      require_protocol: true,
      require_valid_protocol: true,
      protocols: ['smtp', 'smtps'],
    }),
  )
  MAILER_URL?: string =
    'smtps://test:test@localhost:1025/?skip_ssl_verify=true';

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  MAILER_FROM_NAME?: string = 'Ticketing';

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsEmail())
  MAILER_FROM_ADDRESS?: string = 'no-reply@ticketing.local';

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(
    Transform(
      ({ value }) => (value ? value.split(',').map((v) => v.trim()) : []),
      { toClassOnly: true },
    ),
  )
  @decorate(IsArray())
  @decorate(IsEmail({}, { each: true }))
  MODERATORS_EMAILS?: string[] = [];
}
