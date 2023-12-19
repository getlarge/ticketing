const InternalValues = Symbol('internalValues');

type ProxyState = {
  path: Array<string>;
  depth: number;
};

type ProxyStateExtension = {
  [InternalValues]: ProxyState;
};

export const createAccessToPathProxy = <T>(
  onNewPath: (path: Array<string>) => string,
): T => {
  const validator: ProxyHandler<T & ProxyStateExtension> = {
    get(target: T & ProxyStateExtension, p: string | symbol): unknown {
      const internalValues = target[InternalValues];
      const path = internalValues.path;

      if (
        p === 'toString' ||
        p === Symbol.toPrimitive ||
        p === Symbol.toStringTag
      ) {
        return () => onNewPath(path ?? []);
      } else if (typeof p === 'symbol') {
        throw new Error(`Symbols are not supported as keys: ${String(p)}`);
      }

      return new Proxy<T & ProxyStateExtension>(
        {
          ...target,
          [InternalValues]: {
            path: [...path, p],
            depth: internalValues.depth + 1,
          },
        },
        validator,
      );
    },
  };

  return new Proxy<T & ProxyStateExtension>(
    { [InternalValues]: { path: [] as Array<string>, depth: 0 } } as T &
      ProxyStateExtension,
    validator,
  );
};
