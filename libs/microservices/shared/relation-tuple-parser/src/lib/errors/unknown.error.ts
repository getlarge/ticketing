import { defekt } from 'defekt';

export class UnknownError extends defekt<unknown, 'UnknownError'>({
  code: 'UnknownError',
}) {}
