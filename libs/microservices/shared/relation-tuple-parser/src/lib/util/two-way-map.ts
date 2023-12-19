export class TwoWayMap<K, V> {
  private readonly reverseMap = new Map<V, K>();

  constructor(private readonly map: Map<K, V>) {
    map.forEach((value, key) => {
      this.reverseMap.set(value, key);
    });
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  getByValue(value: V): K | undefined {
    return this.reverseMap.get(value);
  }

  values(): IterableIterator<V> {
    return this.map.values();
  }
}
