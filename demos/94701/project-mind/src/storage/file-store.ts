/**
 * @file 文件存储
 * @description 基于文件系统的持久化存储层。使用 JSON Lines 格式存储事件日志，
 *   每个事件占一行 JSON。同时维护项目索引文件和配置文件。
 *
 *   存储结构：
 *   .pmd/
 *   ├── events.jsonl     # 事件日志（JSON Lines 格式）
 *   ├── config.json      # 项目配置
 *   └── index.json       # 索引缓存（加速查询）
 *
 * @package project-mind
 */

import * as fs from 'fs';
import * as path from 'path';
import {ProjectEvent, ProjectMindConfig} from '../types';

/**
 * 文件存储
 *
 * 处理所有文件系统的读写操作，提供事件的持久化、加载和查询接口。
 */
export class FileStore {
  /** .pmd 数据目录的绝对路径 */
  private readonly pmdDir: string;

  /** 事件日志文件路径 */
  private readonly eventsFilePath: string;

  /** 配置文件路径 */
  private readonly configFilePath: string;

  /** 索引文件路径 */
  private readonly indexPath: string;

  /** 写入缓冲区
   *
   * 为了性能，将多个写入操作合并后批量写入文件。
   */
  private writeBuffer: string[] = [];

  /** 缓冲区刷新定时器 ID */
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * @param pmdDir - .pmd 数据目录路径
   */
  constructor(pmdDir: string) {
    this.pmdDir = pmdDir;
    this.eventsFilePath = path.join(pmdDir, 'events.jsonl');
    this.configFilePath = path.join(pmdDir, 'config.json');
    this.indexPath = path.join(pmdDir, 'index.json');
  }

  /**
   * 保存事件到日志文件
   *
   * 立即追加写入到 JSON Lines 文件，每行一个完整的事件对象。
   * 每次写入后立即刷新到磁盘，确保进程退出前数据不会丢失。
   * 对于 CLI 工具（短进程），立即写入比批量缓冲更重要。
   *
   * @param event - 要保存的事件
   */
  async save(event: ProjectEvent): Promise<void> {
    const line = JSON.stringify(event);
    // 立即追加写入，确保进程退出前数据已持久化
    fs.appendFileSync(this.eventsFilePath, line + '\n', 'utf-8');
  }

  /**
   * 从日志文件加载所有事件
   *
   * 逐行读取 JSON Lines 文件，解析每行为事件对象。
   *
   * @returns 所有已持久化的事件列表
   */
  async loadAll(): Promise<ProjectEvent[]> {
    // 先刷新缓冲区，确保读取最新数据
    await this.flush();

    if (!fs.existsSync(this.eventsFilePath)) {
      return [];
    }

    const content = fs.readFileSync(this.eventsFilePath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim() !== '');

    return lines.map((line) => JSON.parse(line) as ProjectEvent);
  }

  /**
   * 从日志文件增量读取事件
   *
   * 支持从指定偏移行开始读取，用于大数据量时的分批处理。
   *
   * @param offset - 起始行号（从 0 开始）
   * @param limit - 最多读取行数
   * @returns 事件列表和下一个偏移量
   */
  async loadRange(
    offset: number,
    limit: number
  ): Promise<{events: ProjectEvent[]; nextOffset: number}> {
    await this.flush();

    if (!fs.existsSync(this.eventsFilePath)) {
      return {events: [], nextOffset: 0};
    }

    const content = fs.readFileSync(this.eventsFilePath, 'utf-8');
    const lines = content
      .split('\n')
      .filter((line) => line.trim() !== '');

    const selectedLines = lines.slice(offset, offset + limit);
    const events = selectedLines.map(
      (line) => JSON.parse(line) as ProjectEvent
    );

    return {
      events,
      nextOffset: offset + limit,
    };
  }

  /**
   * 保存项目配置
   *
   * @param config - 项目配置对象
   */
  async saveConfig(config: ProjectMindConfig): Promise<void> {
    await this.flush();
    fs.writeFileSync(
      this.configFilePath,
      JSON.stringify(config, null, 2),
      'utf-8'
    );
  }

  /**
   * 加载项目配置
   *
   * @returns 项目配置对象
   */
  async loadConfig(): Promise<ProjectMindConfig> {
    if (!fs.existsSync(this.configFilePath)) {
      throw new Error(
        `项目配置文件不存在: ${this.configFilePath}。请先运行 pmd init。`
      );
    }

    const content = fs.readFileSync(this.configFilePath, 'utf-8');
    return JSON.parse(content) as ProjectMindConfig;
  }

  /**
   * 加载索引缓存
   *
   * @returns 索引对象
   */
  async loadIndex(): Promise<Record<string, unknown>> {
    if (!fs.existsSync(this.indexPath)) {
      return {};
    }

    const content = fs.readFileSync(this.indexPath, 'utf-8');
    return JSON.parse(content) as Record<string, unknown>;
  }

  /**
   * 保存索引缓存
   *
   * @param index - 索引对象
   */
  async saveIndex(index: Record<string, unknown>): Promise<void> {
    await this.flush();
    fs.writeFileSync(this.indexPath, JSON.stringify(index, null, 2), 'utf-8');
  }

  /**
   * 删除 .pmd 数据目录及其所有内容
   */
  async destroy(): Promise<void> {
    await this.flush();

    if (fs.existsSync(this.pmdDir)) {
      fs.rmSync(this.pmdDir, {recursive: true, force: true});
    }
  }

  /**
   * 检查 .pmd 目录是否存在
   *
   * @returns 是否存在
   */
  exists(): boolean {
    return fs.existsSync(this.pmdDir);
  }

  /**
   * 刷新写入缓冲区
   *
   * 将缓冲区中的事件批量写入文件。
   */
  private async flush(): Promise<void> {
    if (this.writeBuffer.length === 0) {
      return;
    }

    // 清除定时器
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    const lines = [...this.writeBuffer];
    this.writeBuffer = [];

    // 追加写入文件
    const content = lines.join('\n') + '\n';
    fs.appendFileSync(this.eventsFilePath, content, 'utf-8');
  }
}