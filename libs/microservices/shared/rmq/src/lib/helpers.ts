import { Services } from '@ticketing/shared/constants';

export type ProducerService = Services | 'SELF';

/**
 * @description this function is used to get a unique reply queue name in combination with the exclusive option set to true.
 * It's useful to avoid queue name collision between workers (or dynos in Heroku) of the same service while keeping a meaningful name.
 * The pattern is: {consumerServiceName}_REPLY_{producerServiceName}_{randomSuffix} or {consumerServiceName}_REPLY_{producerServiceName}_{workerId}_{randomSuffix}.
 */
export function getReplyQueueName(
  consumerServiceName: Services,
  producerServiceName: ProducerService,
  workerId?: number,
): string {
  const baseQueueName = `${consumerServiceName}_REPLY_${producerServiceName}_QUEUE`;
  // pseudo random suffix is enough to avoid queue name collision
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  return workerId
    ? `${baseQueueName}_${workerId}-${randomSuffix}`
    : `${baseQueueName}_${randomSuffix}`;
}
