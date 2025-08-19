# Request Cache Service - HTTP Request Caching Service

## Giới thiệu

Request Cache Service là service cốt lõi được thiết kế để quản lý cache cho các HTTP request trong ứng dụng Angular. Service này giúp tối ưu hóa hiệu suất bằng cách lưu trữ và tái sử dụng kết quả của các request, giảm thiểu số lượng request đến server và cải thiện trải nghiệm người dùng.

## Tính năng chính

- **Intelligent Caching**: Cache thông minh dựa trên URL và parameters
- **TTL Support**: Hỗ trợ Time-To-Live cho cache entries
- **Memory Management**: Quản lý bộ nhớ với automatic cleanup
- **Cache Strategies**: Nhiều chiến lược cache khác nhau
- **Conditional Caching**: Cache có điều kiện dựa trên response
- **Cache Invalidation**: Invalidate cache theo pattern hoặc tag
- **Storage Options**: Hỗ trợ memory và localStorage
- **Compression**: Nén data để tiết kiệm bộ nhớ
- **Statistics**: Theo dõi cache hit/miss statistics
- **Event System**: Event system cho cache operations

## Phụ thuộc

Service này phụ thuộc vào các Angular modules:

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpRequest, HttpResponse } from '@angular/common/http';
```

## Tham chiếu API

### Thuộc tính

| Thuộc tính | Kiểu | Mô tả |
|----------|------|-------|
| `isBrowser` | `boolean` | True nếu đang chạy trong browser |
| `maxSize` | `number` | Kích thước tối đa của cache |
| `defaultTTL` | `number` | TTL mặc định (milliseconds) |
| `statistics` | `CacheStatistics` | Thống kê cache |

### Methods

#### Các thao tác Cache cốt lõi
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `get()` | `get<T>(key: string): T \| null` | Lấy data từ cache |
| `set()` | `set<T>(key: string, data: T, ttl?: number): void` | Lưu data vào cache |
| `has()` | `has(key: string): boolean` | Kiểm tra key có tồn tại |
| `delete()` | `delete(key: string): boolean` | Xóa entry khỏi cache |
| `clear()` | `clear(): void` | Xóa toàn bộ cache |

#### Các thao tác đặc thù cho Request
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `cacheRequest()` | `cacheRequest(request: HttpRequest<any>, response: HttpResponse<any>): void` | Cache HTTP request/response |
| `getCachedRequest()` | `getCachedRequest(request: HttpRequest<any>): HttpResponse<any> \| null` | Lấy cached response |
| `shouldCache()` | `shouldCache(request: HttpRequest<any>): boolean` | Kiểm tra có nên cache request |
| `generateKey()` | `generateKey(request: HttpRequest<any>): string` | Tạo cache key từ request |

#### Quản lý Cache
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `invalidate()` | `invalidate(pattern: string \| RegExp): number` | Invalidate cache theo pattern |
| `invalidateByTag()` | `invalidateByTag(tag: string): number` | Invalidate cache theo tag |
| `cleanup()` | `cleanup(): number` | Dọn dẹp expired entries |
| `getSize()` | `getSize(): number` | Lấy số lượng entries |
| `getMemoryUsage()` | `getMemoryUsage(): number` | Lấy memory usage |

#### Cấu hình
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `setConfig()` | `setConfig(config: CacheConfig): void` | Cấu hình cache |
| `getConfig()` | `getConfig(): CacheConfig` | Lấy cấu hình hiện tại |
| `setStrategy()` | `setStrategy(strategy: CacheStrategy): void` | Đặt cache strategy |

#### Thống kê & Giám sát
| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `getStatistics()` | `getStatistics(): CacheStatistics` | Lấy thống kê cache |
| `resetStatistics()` | `resetStatistics(): void` | Reset thống kê |
| `getHitRate()` | `getHitRate(): number` | Lấy cache hit rate |

## Chi tiết triển khai

### Interfaces

```typescript
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags?: string[];
  compressed?: boolean;
  size?: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  compressionThreshold: number;
  enableCompression: boolean;
  enablePersistence: boolean;
  storageKey: string;
  strategy: CacheStrategy;
}

interface CacheStatistics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  clears: number;
  cleanups: number;
  totalRequests: number;
  hitRate: number;
  memoryUsage: number;
  entryCount: number;
}

enum CacheStrategy {
  LRU = 'lru',           // Least Recently Used
  LFU = 'lfu',           // Least Frequently Used
  FIFO = 'fifo',         // First In First Out
  TTL_ONLY = 'ttl_only'  // TTL Only
}

interface CacheEvent {
  type: 'hit' | 'miss' | 'set' | 'delete' | 'clear' | 'cleanup';
  key?: string;
  data?: any;
  timestamp: number;
}
```

### Cấu trúc Service

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestCacheService {
  private _cache = new Map<string, CacheEntry>();
  private _isBrowser: boolean;
  private _config: CacheConfig;
  private _statistics: CacheStatistics;
  private _cleanupTimer: any;
  private _eventSubject = new Subject<CacheEvent>();
  private _accessOrder: string[] = []; // For LRU
  private _accessCount = new Map<string, number>(); // For LFU

  public events$ = this._eventSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this._isBrowser = isPlatformBrowser(this.platformId);
    this._config = this.getDefaultConfig();
    this._statistics = this.initializeStatistics();
    
    this.initializeCache();
  }

  private getDefaultConfig(): CacheConfig {
    return {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      compressionThreshold: 1024, // 1KB
      enableCompression: true,
      enablePersistence: false,
      storageKey: 'cci_request_cache',
      strategy: CacheStrategy.LRU
    };
  }

  private initializeStatistics(): CacheStatistics {
    return {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      clears: 0,
      cleanups: 0,
      totalRequests: 0,
      hitRate: 0,
      memoryUsage: 0,
      entryCount: 0
    };
  }

  private initializeCache(): void {
    // Load persisted cache if enabled
    if (this._config.enablePersistence && this._isBrowser) {
      this.loadPersistedCache();
    }

    // Setup cleanup timer
    if (this._config.cleanupInterval > 0) {
      this._cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this._config.cleanupInterval);
    }
  }

  // Core Cache Operations
  get<T>(key: string): T | null {
    try {
      const entry = this._cache.get(key);
      
      if (!entry) {
        this._statistics.misses++;
        this._statistics.totalRequests++;
        this.updateHitRate();
        this.emitEvent({ type: 'miss', key, timestamp: Date.now() });
        return null;
      }

      // Check TTL
      if (this.isExpired(entry)) {
        this._cache.delete(key);
        this.removeFromAccessTracking(key);
        this._statistics.misses++;
        this._statistics.totalRequests++;
        this.updateHitRate();
        this.emitEvent({ type: 'miss', key, timestamp: Date.now() });
        return null;
      }

      // Update access tracking
      this.updateAccessTracking(key);
      entry.accessCount++;
      entry.lastAccessed = Date.now();

      this._statistics.hits++;
      this._statistics.totalRequests++;
      this.updateHitRate();
      this.emitEvent({ type: 'hit', key, timestamp: Date.now() });

      // Decompress if needed
      const data = entry.compressed ? this.decompress(entry.data) : entry.data;
      return data as T;
      
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    try {
      // Check if cache is full and evict if necessary
      if (this._cache.size >= this._config.maxSize) {
        this.evictEntries(1);
      }

      const now = Date.now();
      const entryTTL = ttl || this._config.defaultTTL;
      
      // Compress data if enabled and size threshold met
      let finalData = data;
      let compressed = false;
      
      if (this._config.enableCompression) {
        const dataSize = this.estimateSize(data);
        if (dataSize > this._config.compressionThreshold) {
          finalData = this.compress(data);
          compressed = true;
        }
      }

      const entry: CacheEntry<T> = {
        data: finalData,
        timestamp: now,
        ttl: entryTTL,
        accessCount: 1,
        lastAccessed: now,
        compressed,
        size: this.estimateSize(finalData)
      };

      this._cache.set(key, entry);
      this.updateAccessTracking(key);
      
      this._statistics.sets++;
      this._statistics.entryCount = this._cache.size;
      this.updateMemoryUsage();
      
      this.emitEvent({ type: 'set', key, data, timestamp: now });
      
      // Persist if enabled
      if (this._config.enablePersistence) {
        this.persistCache();
      }
      
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  has(key: string): boolean {
    const entry = this._cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  delete(key: string): boolean {
    try {
      const deleted = this._cache.delete(key);
      
      if (deleted) {
        this.removeFromAccessTracking(key);
        this._statistics.deletes++;
        this._statistics.entryCount = this._cache.size;
        this.updateMemoryUsage();
        this.emitEvent({ type: 'delete', key, timestamp: Date.now() });
        
        if (this._config.enablePersistence) {
          this.persistCache();
        }
      }
      
      return deleted;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  clear(): void {
    try {
      this._cache.clear();
      this._accessOrder = [];
      this._accessCount.clear();
      
      this._statistics.clears++;
      this._statistics.entryCount = 0;
      this._statistics.memoryUsage = 0;
      
      this.emitEvent({ type: 'clear', timestamp: Date.now() });
      
      if (this._config.enablePersistence) {
        this.clearPersistedCache();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Request-specific Operations
  cacheRequest(request: HttpRequest<any>, response: HttpResponse<any>): void {
    if (!this.shouldCache(request)) {
      return;
    }

    const key = this.generateKey(request);
    const ttl = this.getTTLFromResponse(response);
    
    this.set(key, {
      request: this.serializeRequest(request),
      response: this.serializeResponse(response),
      timestamp: Date.now()
    }, ttl);
  }

  getCachedRequest(request: HttpRequest<any>): HttpResponse<any> | null {
    if (!this.shouldCache(request)) {
      return null;
    }

    const key = this.generateKey(request);
    const cached = this.get(key);
    
    if (cached && cached.response) {
      return this.deserializeResponse(cached.response);
    }
    
    return null;
  }

  shouldCache(request: HttpRequest<any>): boolean {
    // Only cache GET requests by default
    if (request.method !== 'GET') {
      return false;
    }

    // Don't cache requests with authorization headers (unless explicitly allowed)
    if (request.headers.has('Authorization')) {
      return false;
    }

    // Don't cache requests with cache-control: no-cache
    const cacheControl = request.headers.get('Cache-Control');
    if (cacheControl && cacheControl.includes('no-cache')) {
      return false;
    }

    return true;
  }

  generateKey(request: HttpRequest<any>): string {
    const url = request.urlWithParams;
    const method = request.method;
    const headers = this.getRelevantHeaders(request);
    
    return `${method}:${url}:${JSON.stringify(headers)}`;
  }

  private getRelevantHeaders(request: HttpRequest<any>): any {
    const relevantHeaders: any = {};
    const headersToInclude = ['Accept', 'Content-Type', 'Accept-Language'];
    
    headersToInclude.forEach(header => {
      if (request.headers.has(header)) {
        relevantHeaders[header] = request.headers.get(header);
      }
    });
    
    return relevantHeaders;
  }

  private getTTLFromResponse(response: HttpResponse<any>): number {
    // Check Cache-Control header
    const cacheControl = response.headers.get('Cache-Control');
    if (cacheControl) {
      const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        return parseInt(maxAgeMatch[1]) * 1000; // Convert to milliseconds
      }
    }

    // Check Expires header
    const expires = response.headers.get('Expires');
    if (expires) {
      const expiresDate = new Date(expires);
      const now = new Date();
      const ttl = expiresDate.getTime() - now.getTime();
      if (ttl > 0) {
        return ttl;
      }
    }

    return this._config.defaultTTL;
  }

  private serializeRequest(request: HttpRequest<any>): any {
    return {
      method: request.method,
      url: request.url,
      urlWithParams: request.urlWithParams,
      headers: this.headersToObject(request.headers),
      body: request.body
    };
  }

  private serializeResponse(response: HttpResponse<any>): any {
    return {
      body: response.body,
      headers: this.headersToObject(response.headers),
      status: response.status,
      statusText: response.statusText,
      url: response.url
    };
  }

  private deserializeResponse(serialized: any): HttpResponse<any> {
    return new HttpResponse({
      body: serialized.body,
      headers: serialized.headers,
      status: serialized.status,
      statusText: serialized.statusText,
      url: serialized.url
    });
  }

  private headersToObject(headers: any): any {
    const obj: any = {};
    if (headers && headers.keys) {
      headers.keys().forEach((key: string) => {
        obj[key] = headers.get(key);
      });
    }
    return obj;
  }

  // Cache Management
  invalidate(pattern: string | RegExp): number {
    let count = 0;
    const keys = Array.from(this._cache.keys());
    
    keys.forEach(key => {
      let shouldDelete = false;
      
      if (typeof pattern === 'string') {
        shouldDelete = key.includes(pattern);
      } else {
        shouldDelete = pattern.test(key);
      }
      
      if (shouldDelete) {
        this.delete(key);
        count++;
      }
    });
    
    return count;
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    const entries = Array.from(this._cache.entries());
    
    entries.forEach(([key, entry]) => {
      if (entry.tags && entry.tags.includes(tag)) {
        this.delete(key);
        count++;
      }
    });
    
    return count;
  }

  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();
    const entries = Array.from(this._cache.entries());
    
    entries.forEach(([key, entry]) => {
      if (this.isExpired(entry)) {
        this.delete(key);
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      this._statistics.cleanups++;
      this.emitEvent({ type: 'cleanup', timestamp: now });
    }
    
    return cleaned;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictEntries(count: number): void {
    const keysToEvict = this.selectKeysForEviction(count);
    keysToEvict.forEach(key => this.delete(key));
  }

  private selectKeysForEviction(count: number): string[] {
    const keys: string[] = [];
    
    switch (this._config.strategy) {
      case CacheStrategy.LRU:
        keys.push(...this._accessOrder.slice(0, count));
        break;
        
      case CacheStrategy.LFU:
        const sortedByFrequency = Array.from(this._cache.keys())
          .sort((a, b) => (this._accessCount.get(a) || 0) - (this._accessCount.get(b) || 0));
        keys.push(...sortedByFrequency.slice(0, count));
        break;
        
      case CacheStrategy.FIFO:
        const sortedByTimestamp = Array.from(this._cache.entries())
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)
          .slice(0, count)
          .map(([key]) => key);
        keys.push(...sortedByTimestamp);
        break;
        
      case CacheStrategy.TTL_ONLY:
        // Evict expired entries first, then oldest
        const now = Date.now();
        const expired = Array.from(this._cache.entries())
          .filter(([, entry]) => this.isExpired(entry))
          .slice(0, count)
          .map(([key]) => key);
        
        if (expired.length < count) {
          const remaining = count - expired.length;
          const oldest = Array.from(this._cache.entries())
            .filter(([key]) => !expired.includes(key))
            .sort(([, a], [, b]) => a.timestamp - b.timestamp)
            .slice(0, remaining)
            .map(([key]) => key);
          keys.push(...expired, ...oldest);
        } else {
          keys.push(...expired);
        }
        break;
    }
    
    return keys;
  }

  private updateAccessTracking(key: string): void {
    // Update LRU tracking
    const index = this._accessOrder.indexOf(key);
    if (index > -1) {
      this._accessOrder.splice(index, 1);
    }
    this._accessOrder.push(key);
    
    // Update LFU tracking
    const currentCount = this._accessCount.get(key) || 0;
    this._accessCount.set(key, currentCount + 1);
  }

  private removeFromAccessTracking(key: string): void {
    const index = this._accessOrder.indexOf(key);
    if (index > -1) {
      this._accessOrder.splice(index, 1);
    }
    this._accessCount.delete(key);
  }

  // Compression
  private compress(data: any): string {
    try {
      // Simple compression using JSON + base64
      // In production, consider using a proper compression library
      const jsonString = JSON.stringify(data);
      return btoa(jsonString);
    } catch (error) {
      console.warn('Compression failed:', error);
      return data;
    }
  }

  private decompress(compressedData: string): any {
    try {
      const jsonString = atob(compressedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Decompression failed:', error);
      return compressedData;
    }
  }

  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
    } catch {
      return 0;
    }
  }

  // Persistence
  private loadPersistedCache(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(this._config.storageKey);
        if (cached) {
          const data = JSON.parse(cached);
          Object.entries(data).forEach(([key, entry]: [string, any]) => {
            if (!this.isExpired(entry)) {
              this._cache.set(key, entry);
            }
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted cache:', error);
    }
  }

  private persistCache(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = Object.fromEntries(this._cache.entries());
        localStorage.setItem(this._config.storageKey, JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Failed to persist cache:', error);
    }
  }

  private clearPersistedCache(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this._config.storageKey);
      }
    } catch (error) {
      console.warn('Failed to clear persisted cache:', error);
    }
  }

  // Statistics
  private updateHitRate(): void {
    this._statistics.hitRate = this._statistics.totalRequests > 0 
      ? (this._statistics.hits / this._statistics.totalRequests) * 100 
      : 0;
  }

  private updateMemoryUsage(): void {
    let totalSize = 0;
    this._cache.forEach(entry => {
      totalSize += entry.size || 0;
    });
    this._statistics.memoryUsage = totalSize;
  }

  private emitEvent(event: CacheEvent): void {
    this._eventSubject.next(event);
  }

  // Public API
  getSize(): number {
    return this._cache.size;
  }

  getMemoryUsage(): number {
    return this._statistics.memoryUsage;
  }

  getStatistics(): CacheStatistics {
    return { ...this._statistics };
  }

  resetStatistics(): void {
    this._statistics = this.initializeStatistics();
  }

  getHitRate(): number {
    return this._statistics.hitRate;
  }

  setConfig(config: Partial<CacheConfig>): void {
    this._config = { ...this._config, ...config };
    
    // Restart cleanup timer if interval changed
    if (config.cleanupInterval !== undefined) {
      if (this._cleanupTimer) {
        clearInterval(this._cleanupTimer);
      }
      
      if (this._config.cleanupInterval > 0) {
        this._cleanupTimer = setInterval(() => {
          this.cleanup();
        }, this._config.cleanupInterval);
      }
    }
  }

  getConfig(): CacheConfig {
    return { ...this._config };
  }

  setStrategy(strategy: CacheStrategy): void {
    this._config.strategy = strategy;
  }

  get isBrowser(): boolean {
    return this._isBrowser;
  }

  get maxSize(): number {
    return this._config.maxSize;
  }

  get defaultTTL(): number {
    return this._config.defaultTTL;
  }

  get statistics(): CacheStatistics {
    return this.getStatistics();
  }

  // Cleanup on destroy
  ngOnDestroy(): void {
    if (this._cleanupTimer) {
      clearInterval(this._cleanupTimer);
    }
    this._eventSubject.complete();
  }

  // Debug methods
  getDebugInfo(): any {
    return {
      config: this._config,
      statistics: this._statistics,
      cacheSize: this._cache.size,
      accessOrder: [...this._accessOrder],
      accessCount: Object.fromEntries(this._accessCount.entries()),
      entries: Array.from(this._cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        expired: this.isExpired(entry),
        size: entry.size,
        compressed: entry.compressed
      }))
    };
  }

  exportCache(): string {
    const data = {
      config: this._config,
      statistics: this._statistics,
      entries: Object.fromEntries(this._cache.entries())
    };
    return JSON.stringify(data, null, 2);
  }

  importCache(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.config) {
        this.setConfig(parsed.config);
      }
      
      if (parsed.entries) {
        this.clear();
        Object.entries(parsed.entries).forEach(([key, entry]: [string, any]) => {
          if (!this.isExpired(entry)) {
            this._cache.set(key, entry);
          }
        });
      }
      
      if (parsed.statistics) {
        this._statistics = { ...this._statistics, ...parsed.statistics };
      }
      
    } catch (error) {
      console.error('Failed to import cache:', error);
    }
  }
}
```

## Cách sử dụng

### Sử dụng Cache cơ bản

```typescript
import { Component, OnInit } from '@angular/core';
import { RequestCacheService } from '@cci-web/core';

@Component({
  selector: 'app-cache-demo',
  template: `
    <div class="cache-demo">
      <h2>Request Cache Demo</h2>
      
      <div class="cache-controls">
        <button (click)="setData()">Set Data</button>
        <button (click)="getData()">Get Data</button>
        <button (click)="clearCache()">Clear Cache</button>
        <button (click)="showStatistics()">Show Statistics</button>
      </div>
      
      <div class="cache-info">
        <h3>Cache Information</h3>
        <p>Size: {{ cacheSize }}</p>
        <p>Hit Rate: {{ hitRate }}%</p>
        <p>Memory Usage: {{ memoryUsage }} bytes</p>
      </div>
      
      <div class="cached-data" *ngIf="cachedData">
        <h3>Cached Data</h3>
        <pre>{{ cachedData | json }}</pre>
      </div>
      
      <div class="statistics" *ngIf="statistics">
        <h3>Cache Statistics</h3>
        <pre>{{ statistics | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .cache-demo { padding: 20px; }
    .cache-controls button { margin-right: 10px; margin-bottom: 10px; }
    .cache-info p { margin: 5px 0; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
  `]
})
export class CacheDemoComponent implements OnInit {
  cachedData: any = null;
  statistics: any = null;

  constructor(private cacheService: RequestCacheService) {}

  ngOnInit() {
    // Configure cache
    this.cacheService.setConfig({
      maxSize: 50,
      defaultTTL: 2 * 60 * 1000, // 2 minutes
      enableCompression: true,
      strategy: CacheStrategy.LRU
    });

    // Subscribe to cache events
    this.cacheService.events$.subscribe(event => {
      console.log('Cache event:', event);
    });
  }

  setData(): void {
    const data = {
      id: Date.now(),
      message: 'Hello from cache!',
      timestamp: new Date().toISOString(),
      randomData: Array.from({ length: 100 }, () => Math.random())
    };
    
    this.cacheService.set('demo-data', data, 5 * 60 * 1000); // 5 minutes TTL
    console.log('Data cached successfully');
  }

  getData(): void {
    this.cachedData = this.cacheService.get('demo-data');
    if (this.cachedData) {
      console.log('Data retrieved from cache');
    } else {
      console.log('No data found in cache');
    }
  }

  clearCache(): void {
    this.cacheService.clear();
    this.cachedData = null;
    console.log('Cache cleared');
  }

  showStatistics(): void {
    this.statistics = this.cacheService.getStatistics();
  }

  get cacheSize(): number {
    return this.cacheService.getSize();
  }

  get hitRate(): number {
    return Math.round(this.cacheService.getHitRate() * 100) / 100;
  }

  get memoryUsage(): number {
    return this.cacheService.getMemoryUsage();
  }
}
```

### HTTP Interceptor with Cache

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestCacheService } from '@cci-web/core';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(private cacheService: RequestCacheService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if request should be cached
    if (!this.cacheService.shouldCache(request)) {
      return next.handle(request);
    }

    // Try to get cached response
    const cachedResponse = this.cacheService.getCachedRequest(request);
    if (cachedResponse) {
      console.log('Serving from cache:', request.url);
      return of(cachedResponse);
    }

    // Make request and cache response
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log('Caching response:', request.url);
          this.cacheService.cacheRequest(request, event);
        }
      })
    );
  }
}

// Register interceptor in app module
@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true
    }
  ]
})
export class AppModule {}
```

### Service quản lý Cache nâng cao

```typescript
import { Injectable } from '@angular/core';
import { RequestCacheService, CacheStrategy } from '@cci-web/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

interface CachePolicy {
  pattern: string | RegExp;
  ttl: number;
  strategy: CacheStrategy;
  tags?: string[];
  compress?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdvancedCacheService {
  private policies: CachePolicy[] = [];
  private cacheGroups = new Map<string, Set<string>>();

  constructor(private cacheService: RequestCacheService) {
    this.initializeDefaultPolicies();
    this.setupCacheMonitoring();
  }

  private initializeDefaultPolicies(): void {
    // API data cache policy
    this.addPolicy({
      pattern: /\/api\/(users|products|categories)/,
      ttl: 10 * 60 * 1000, // 10 minutes
      strategy: CacheStrategy.LRU,
      tags: ['api-data'],
      compress: true
    });

    // Static content cache policy
    this.addPolicy({
      pattern: /\.(js|css|png|jpg|jpeg|gif|svg)$/,
      ttl: 60 * 60 * 1000, // 1 hour
      strategy: CacheStrategy.TTL_ONLY,
      tags: ['static-content']
    });

    // User-specific data cache policy
    this.addPolicy({
      pattern: /\/api\/user\/profile/,
      ttl: 5 * 60 * 1000, // 5 minutes
      strategy: CacheStrategy.LFU,
      tags: ['user-data']
    });
  }

  private setupCacheMonitoring(): void {
    // Monitor cache events
    this.cacheService.events$.subscribe(event => {
      this.handleCacheEvent(event);
    });

    // Periodic cache optimization
    timer(0, 5 * 60 * 1000).subscribe(() => {
      this.optimizeCache();
    });
  }

  private handleCacheEvent(event: any): void {
    switch (event.type) {
      case 'set':
        this.trackCacheGroup(event.key);
        break;
      case 'delete':
        this.untrackCacheGroup(event.key);
        break;
      case 'clear':
        this.cacheGroups.clear();
        break;
    }
  }

  private trackCacheGroup(key: string): void {
    const policy = this.findPolicyForKey(key);
    if (policy && policy.tags) {
      policy.tags.forEach(tag => {
        if (!this.cacheGroups.has(tag)) {
          this.cacheGroups.set(tag, new Set());
        }
        this.cacheGroups.get(tag)!.add(key);
      });
    }
  }

  private untrackCacheGroup(key: string): void {
    this.cacheGroups.forEach(group => {
      group.delete(key);
    });
  }

  private findPolicyForKey(key: string): CachePolicy | null {
    return this.policies.find(policy => {
      if (typeof policy.pattern === 'string') {
        return key.includes(policy.pattern);
      } else {
        return policy.pattern.test(key);
      }
    }) || null;
  }

  // Public API
  addPolicy(policy: CachePolicy): void {
    this.policies.push(policy);
  }

  removePolicy(pattern: string | RegExp): void {
    this.policies = this.policies.filter(p => p.pattern !== pattern);
  }

  getPolicies(): CachePolicy[] {
    return [...this.policies];
  }

  // Cache group management
  invalidateGroup(tag: string): number {
    const group = this.cacheGroups.get(tag);
    if (!group) return 0;

    let count = 0;
    group.forEach(key => {
      if (this.cacheService.delete(key)) {
        count++;
      }
    });

    this.cacheGroups.delete(tag);
    return count;
  }

  getGroupKeys(tag: string): string[] {
    const group = this.cacheGroups.get(tag);
    return group ? Array.from(group) : [];
  }

  getGroupSize(tag: string): number {
    const group = this.cacheGroups.get(tag);
    return group ? group.size : 0;
  }

  getAllGroups(): Map<string, Set<string>> {
    return new Map(this.cacheGroups);
  }

  // Cache optimization
  optimizeCache(): void {
    console.log('Optimizing cache...');
    
    // Cleanup expired entries
    const cleaned = this.cacheService.cleanup();
    console.log(`Cleaned ${cleaned} expired entries`);
    
    // Check memory usage
    const memoryUsage = this.cacheService.getMemoryUsage();
    const maxMemory = 10 * 1024 * 1024; // 10MB limit
    
    if (memoryUsage > maxMemory) {
      console.log('Memory usage high, triggering eviction');
      this.evictLowValueEntries();
    }
    
    // Log statistics
    const stats = this.cacheService.getStatistics();
    console.log('Cache statistics:', stats);
  }

  private evictLowValueEntries(): void {
    // Implement custom eviction logic based on access patterns
    const debugInfo = this.cacheService.getDebugInfo();
    const entries = debugInfo.entries;
    
    // Sort by access count and last accessed time
    const lowValueEntries = entries
      .filter((entry: any) => entry.accessCount < 2)
      .sort((a: any, b: any) => a.lastAccessed - b.lastAccessed)
      .slice(0, 10); // Evict up to 10 entries
    
    lowValueEntries.forEach((entry: any) => {
      this.cacheService.delete(entry.key);
    });
    
    console.log(`Evicted ${lowValueEntries.length} low-value entries`);
  }

  // Cache warming
  warmCache(urls: string[]): Observable<number> {
    let warmed = 0;
    
    return new Observable(observer => {
      urls.forEach(async (url) => {
        try {
          // This would typically make HTTP requests to warm the cache
          // For demo purposes, we'll just set some dummy data
          this.cacheService.set(`warm:${url}`, { url, warmed: true });
          warmed++;
          
          if (warmed === urls.length) {
            observer.next(warmed);
            observer.complete();
          }
        } catch (error) {
          console.error(`Failed to warm cache for ${url}:`, error);
        }
      });
    });
  }

  // Cache analysis
  analyzeCache(): any {
    const stats = this.cacheService.getStatistics();
    const debugInfo = this.cacheService.getDebugInfo();
    
    return {
      performance: {
        hitRate: stats.hitRate,
        totalRequests: stats.totalRequests,
        averageResponseTime: this.calculateAverageResponseTime()
      },
      memory: {
        usage: stats.memoryUsage,
        entryCount: stats.entryCount,
        averageEntrySize: stats.memoryUsage / stats.entryCount
      },
      patterns: {
        mostAccessed: this.getMostAccessedEntries(debugInfo.entries),
        leastAccessed: this.getLeastAccessedEntries(debugInfo.entries),
        expiringSoon: this.getExpiringSoonEntries(debugInfo.entries)
      },
      groups: Object.fromEntries(
        Array.from(this.cacheGroups.entries()).map(([tag, keys]) => [
          tag,
          {
            size: keys.size,
            keys: Array.from(keys)
          }
        ])
      )
    };
  }

  private calculateAverageResponseTime(): number {
    // This would require tracking response times
    // For demo purposes, return a mock value
    return 150; // ms
  }

  private getMostAccessedEntries(entries: any[]): any[] {
    return entries
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5)
      .map(entry => ({
        key: entry.key,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed
      }));
  }

  private getLeastAccessedEntries(entries: any[]): any[] {
    return entries
      .sort((a, b) => a.accessCount - b.accessCount)
      .slice(0, 5)
      .map(entry => ({
        key: entry.key,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed
      }));
  }

  private getExpiringSoonEntries(entries: any[]): any[] {
    const now = Date.now();
    const soonThreshold = 5 * 60 * 1000; // 5 minutes
    
    return entries
      .filter(entry => {
        const timeToExpire = (entry.timestamp + entry.ttl) - now;
        return timeToExpire > 0 && timeToExpire < soonThreshold;
      })
      .sort((a, b) => {
        const aTimeToExpire = (a.timestamp + a.ttl) - now;
        const bTimeToExpire = (b.timestamp + b.ttl) - now;
        return aTimeToExpire - bTimeToExpire;
      })
      .slice(0, 5)
      .map(entry => ({
        key: entry.key,
        timeToExpire: (entry.timestamp + entry.ttl) - now
      }));
  }

  // Export/Import functionality
  exportCacheData(): string {
    return this.cacheService.exportCache();
  }

  importCacheData(data: string): void {
    this.cacheService.importCache(data);
  }

  // Health check
  healthCheck(): { status: string; issues: string[] } {
    const issues: string[] = [];
    const stats = this.cacheService.getStatistics();
    
    // Check hit rate
    if (stats.hitRate < 50) {
      issues.push('Low cache hit rate (< 50%)');
    }
    
    // Check memory usage
    const maxMemory = 10 * 1024 * 1024; // 10MB
    if (stats.memoryUsage > maxMemory * 0.9) {
      issues.push('High memory usage (> 90% of limit)');
    }
    
    // Check cache size
    if (stats.entryCount > this.cacheService.maxSize * 0.9) {
      issues.push('Cache nearly full (> 90% of max size)');
    }
    
    return {
      status: issues.length === 0 ? 'healthy' : 'warning',
      issues
    };
  }
}
```

## Thực hành tốt nhất

### 1. Cache Key Strategy

```typescript
// ✅ Good: Consistent and descriptive cache keys
class CacheKeyService {
  generateUserKey(userId: string): string {
    return `user:${userId}`;
  }
  
  generateProductKey(productId: string, variant?: string): string {
    return variant ? `product:${productId}:${variant}` : `product:${productId}`;
  }
  
  generateListKey(type: string, filters: any): string {
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    return `list:${type}:${filterString}`;
  }
}
```

### 2. TTL Management

```typescript
// ✅ Good: Different TTL for different data types
class TTLStrategy {
  getUserDataTTL(): number {
    return 5 * 60 * 1000; // 5 minutes - frequently changing
  }
  
  getProductDataTTL(): number {
    return 30 * 60 * 1000; // 30 minutes - moderately changing
  }
  
  getStaticDataTTL(): number {
    return 24 * 60 * 60 * 1000; // 24 hours - rarely changing
  }
}
```

### 3. Cache Invalidation

```typescript
// ✅ Good: Strategic cache invalidation
class CacheInvalidationService {
  constructor(private cacheService: RequestCacheService) {}
  
  onUserUpdate(userId: string): void {
    // Invalidate user-specific cache
    this.cacheService.invalidate(`user:${userId}`);
    
    // Invalidate related lists
    this.cacheService.invalidate(/list:users/);
  }
  
  onProductUpdate(productId: string): void {
    // Invalidate product cache
    this.cacheService.invalidate(`product:${productId}`);
    
    // Invalidate product lists
    this.cacheService.invalidate(/list:products/);
  }
}
```

### 4. Memory Management

```typescript
// ✅ Good: Proactive memory management
class CacheMemoryManager {
  constructor(private cacheService: RequestCacheService) {
    this.setupMemoryMonitoring();
  }
  
  private setupMemoryMonitoring(): void {
    setInterval(() => {
      const usage = this.cacheService.getMemoryUsage();
      const maxMemory = 10 * 1024 * 1024; // 10MB
      
      if (usage > maxMemory * 0.8) {
        console.warn('Cache memory usage high, cleaning up');
        this.cacheService.cleanup();
      }
    }, 60000); // Check every minute
  }
}
```

## Cân nhắc về hiệu suất

### 1. Cache Strategy Selection
- **LRU**: Tốt cho access patterns có locality
- **LFU**: Tốt cho data có frequency patterns rõ ràng
- **FIFO**: Đơn giản, tốt cho uniform access patterns
- **TTL_ONLY**: Tốt khi TTL là yếu tố quan trọng nhất

### 2. Memory Optimization
- Sử dụng compression cho large data
- Set appropriate TTL để tránh memory leaks
- Regular cleanup của expired entries
- Monitor memory usage và set limits

### 3. Network Optimization
- Cache GET requests để giảm network calls
- Respect HTTP cache headers
- Implement conditional requests (ETag, Last-Modified)

## Khắc phục sự cố

### Common Issues

**1. Cache not working in SSR**
```typescript
// Check platform before caching
if (this.cacheService.isBrowser) {
  this.cacheService.set(key, data);
}
```

**2. Memory leaks**
```typescript
// Monitor memory usage
const usage = this.cacheService.getMemoryUsage();
if (usage > threshold) {
  this.cacheService.cleanup();
}
```

**3. Cache invalidation not working**
```typescript
// Use specific patterns for invalidation
this.cacheService.invalidate(/^user:123:/); // Specific pattern
this.cacheService.invalidateByTag('user-data'); // By tag
```

## Dependencies

- `@angular/core`: Angular framework
- `@angular/common`: Platform detection
- `@angular/common/http`: HTTP request/response types
- `rxjs`: Observable patterns

## Related Services

- **ApiService**: HTTP request handling
- **PlatformService**: Platform detection
- **WindowService**: Window object access
- **ConfigMergeService**: Cache configuration