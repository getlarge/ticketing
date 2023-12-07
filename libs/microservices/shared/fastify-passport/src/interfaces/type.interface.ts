// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Type<T = any> = new (...args: any[]) => T;
