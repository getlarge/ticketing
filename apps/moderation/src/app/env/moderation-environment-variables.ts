import { applyDecorators } from '@nestjs/common';
import { Expose, Type } from 'class-transformer';
import { IsNumber, IsString, Max, Min } from 'class-validator';
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
}
