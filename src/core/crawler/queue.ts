// Prioritized Crawl Queue & Deduplication Engine

import { URLCategory } from '../../types/schema.ts';
import { getUrlCrawlPriority } from './urlUtils.ts';

export interface CrawlQueueItem {
  url: string;
  normalizedUrl: string;
  category: URLCategory;
  priority: number;
  depth: number;
  parentUrl?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  attemptCount: number;
  discoveredAt: string;
  processedAt?: string;
  error?: string;
  contentHash?: string;
}

export class CrawlQueue {
  private items: Map<string, CrawlQueueItem> = new Map();
  private visitedUrls: Set<string> = new Set();
  private contentHashes: Set<string> = new Set();

  constructor(private maxDepth: number = 4) {}

  public enqueue(
    normalizedUrl: string,
    rawUrl: string,
    category: URLCategory,
    depth: number,
    parentUrl?: string
  ): boolean {
    if (depth > this.maxDepth) return false;
    if (this.visitedUrls.has(normalizedUrl)) return false;
    if (this.items.has(normalizedUrl)) return false;

    const priority = getUrlCrawlPriority(category);
    const item: CrawlQueueItem = {
      url: rawUrl,
      normalizedUrl,
      category,
      priority,
      depth,
      parentUrl,
      status: 'PENDING',
      attemptCount: 0,
      discoveredAt: new Date().toISOString(),
    };

    this.items.set(normalizedUrl, item);
    return true;
  }

  public getNextItem(): CrawlQueueItem | null {
    let highestPriorityItem: CrawlQueueItem | null = null;

    for (const item of this.items.values()) {
      if (item.status === 'PENDING') {
        if (!highestPriorityItem || item.priority > highestPriorityItem.priority) {
          highestPriorityItem = item;
        }
      }
    }

    if (highestPriorityItem) {
      highestPriorityItem.status = 'PROCESSING';
      highestPriorityItem.attemptCount += 1;
    }

    return highestPriorityItem;
  }

  public markCompleted(normalizedUrl: string, contentHash: string): void {
    const item = this.items.get(normalizedUrl);
    if (item) {
      item.status = 'COMPLETED';
      item.processedAt = new Date().toISOString();
      item.contentHash = contentHash;
      this.visitedUrls.add(normalizedUrl);
      this.contentHashes.add(contentHash);
    }
  }

  public markFailed(normalizedUrl: string, error: string): void {
    const item = this.items.get(normalizedUrl);
    if (item) {
      if (item.attemptCount < 3) {
        item.status = 'PENDING'; // Retry
        item.error = error;
      } else {
        item.status = 'FAILED';
        item.processedAt = new Date().toISOString();
        item.error = error;
        this.visitedUrls.add(normalizedUrl);
      }
    }
  }

  public isContentDuplicate(hash: string): boolean {
    return this.contentHashes.has(hash);
  }

  public getStats() {
    let pending = 0;
    let completed = 0;
    let failed = 0;
    let processing = 0;

    for (const item of this.items.values()) {
      if (item.status === 'PENDING') pending++;
      else if (item.status === 'COMPLETED') completed++;
      else if (item.status === 'FAILED') failed++;
      else if (item.status === 'PROCESSING') processing++;
    }

    return {
      totalDiscovered: this.items.size,
      pending,
      completed,
      failed,
      processing,
      uniqueContentHashes: this.contentHashes.size,
    };
  }

  public getAllItems(): CrawlQueueItem[] {
    return Array.from(this.items.values());
  }
}
