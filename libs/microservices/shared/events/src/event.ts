import { Patterns } from './patterns';

export interface Event {
  name: Patterns;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}
