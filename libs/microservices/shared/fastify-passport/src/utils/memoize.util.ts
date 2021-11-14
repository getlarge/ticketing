const defaultKey = 'default';

export function memoize<T = any>(
  fn: (key?: string | string[]) => T
): (...args: string[]) => T {
  const cache = {};
  return (...args: string[]) => {
    const n = args[0] || defaultKey;
    if (n in cache) {
      return cache[n];
    } else {
      const result = fn(n === defaultKey ? undefined : n);
      cache[n] = result;
      return result;
    }
  };
}
