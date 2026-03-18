/**
 * 轻量 LRU Map —— 基于 Map 的插入顺序特性实现。
 *
 * 当 size 超过 maxSize 时，淘汰最久未访问的 key。
 * get / set 都会将 key 移到最新位置。
 *
 * 用于限制进程内缓存的 Map 大小，防止长期运行后 OOM。
 */

export class LruMap<K, V> {
  private readonly map = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    if (maxSize < 1) throw new Error('LruMap maxSize must be >= 1');
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.map.get(key);
    if (value === undefined) return undefined;
    // Move to end (most recently used)
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    // If key exists, delete first to refresh position
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, value);
    // Evict oldest if over capacity
    if (this.map.size > this.maxSize) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) {
        this.map.delete(oldest);
      }
    }
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  get size(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }
}
