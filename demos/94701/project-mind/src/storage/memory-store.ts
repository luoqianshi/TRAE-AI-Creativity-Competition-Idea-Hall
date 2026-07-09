/**
 * @file 内存缓存
 * @description 基于内存的索引缓存层，加速事件的查询和访问。
 *   实现 LRU（Least Recently Used）缓存策略，在有限的内存中
 *   保留最近访问最频繁的数据。
 *
 *   核心职责：
 *   - 缓存索引以加速事件查询
 *   - 维护最近事件的 LRU 缓存
 *   - 提供快速的键值存储接口
 *
 * @package project-mind
 */

/**
 * LRU 缓存节点
 *
 * 双向链表的节点，用于实现 LRU 淘汰策略。
 */
interface LRUNode<T> {
  key: string;
  value: T;
  prev: LRUNode<T> | null;
  next: LRUNode<T> | null;
}

/**
 * 内存缓存
 *
 * 提供键值存储和 LRU 缓存能力的线程安全内存缓存。
 */
export class MemoryStore {
  /** 通用键值存储 */
  private readonly store: Map<string, unknown> = new Map();

  /** LRU 缓存容量 */
  private readonly lruCapacity: number;

  /** LRU 缓存的头节点（最近使用的） */
  private lruHead: LRUNode<unknown> | null = null;

  /** LRU 缓存的尾节点（最久未使用的） */
  private lruTail: LRUNode<unknown> | null = null;

  /** LRU 缓存的哈希表，实现 O(1) 查找 */
  private readonly lruMap: Map<string, LRUNode<unknown>> = new Map();

  /**
   * @param lruCapacity - LRU 缓存最大容量，默认 100
   */
  constructor(lruCapacity: number = 100) {
    this.lruCapacity = lruCapacity;
  }

  /**
   * 设置缓存值
   *
   * 如果值不为 undefined，存入通用存储并更新 LRU 缓存。
   *
   * @param key - 键
   * @param value - 值
   */
  set(key: string, value: unknown): void {
    this.store.set(key, value);
    this.setLRU(key, value);
  }

  /**
   * 获取缓存值
   *
   * @param key - 键
   * @returns 值（不存在时返回 undefined）
   */
  get<T = unknown>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }

  /**
   * 检查键是否存在
   *
   * @param key - 键
   * @returns 是否存在
   */
  has(key: string): boolean {
    return this.store.has(key);
  }

  /**
   * 删除缓存值
   *
   * @param key - 键
   * @returns 是否成功删除
   */
  delete(key: string): boolean {
    this.deleteLRU(key);
    return this.store.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.store.clear();
    this.lruHead = null;
    this.lruTail = null;
    this.lruMap.clear();
  }

  /**
   * 获取缓存大小
   *
   * @returns 键数量
   */
  size(): number {
    return this.store.size;
  }

  /**
   * 获取所有缓存键
   *
   * @returns 键列表
   */
  keys(): string[] {
    return [...this.store.keys()];
  }

  /**
   * 批量设置缓存
   *
   * @param entries - 键值对数组
   */
  setMany(entries: Array<[string, unknown]>): void {
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  /**
   * 获取匹配前缀的所有键值对
   *
   * @param prefix - 键前缀
   * @returns 匹配的键值对
   */
  getByPrefix(prefix: string): Array<[string, unknown]> {
    const results: Array<[string, unknown]> = [];
    for (const [key, value] of this.store) {
      if (key.startsWith(prefix)) {
        results.push([key, value]);
      }
    }
    return results;
  }

  // =========================================================================
  // LRU 缓存实现
  // =========================================================================

  /**
   * 在 LRU 缓存中设置值
   *
   * @param key - 键
   * @param value - 值
   */
  private setLRU(key: string, value: unknown): void {
    const existingNode = this.lruMap.get(key);

    if (existingNode) {
      // 已存在：更新值并移到头部
      existingNode.value = value;
      this.moveToHead(existingNode);
    } else {
      // 不存在：创建新节点并插入头部
      const newNode: LRUNode<unknown> = {
        key,
        value,
        prev: null,
        next: null,
      };

      this.addToHead(newNode);
      this.lruMap.set(key, newNode);

      // 超过容量，淘汰尾部节点
      if (this.lruMap.size > this.lruCapacity) {
        this.removeTail();
      }
    }
  }

  /**
   * 在 LRU 缓存中删除值
   *
   * @param key - 键
   */
  private deleteLRU(key: string): void {
    const node = this.lruMap.get(key);
    if (!node) return;

    this.removeNode(node);
    this.lruMap.delete(key);
  }

  /**
   * 将节点移动到链表头部（表示最近使用）
   *
   * @param node - 要移动的节点
   */
  private moveToHead(node: LRUNode<unknown>): void {
    if (node === this.lruHead) return;
    this.removeNode(node);
    this.addToHead(node);
  }

  /**
   * 将节点添加到链表头部
   *
   * @param node - 要添加的节点
   */
  private addToHead(node: LRUNode<unknown>): void {
    node.prev = null;
    node.next = this.lruHead;

    if (this.lruHead) {
      this.lruHead.prev = node;
    }
    this.lruHead = node;

    if (!this.lruTail) {
      this.lruTail = node;
    }
  }

  /**
   * 从链表中移除节点
   *
   * @param node - 要移除的节点
   */
  private removeNode(node: LRUNode<unknown>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.lruHead = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.lruTail = node.prev;
    }
  }

  /**
   * 移除并淘汰链表尾部节点（最久未使用）
   */
  private removeTail(): void {
    if (!this.lruTail) return;

    const tail = this.lruTail;
    this.removeNode(tail);
    this.lruMap.delete(tail.key);
  }
}