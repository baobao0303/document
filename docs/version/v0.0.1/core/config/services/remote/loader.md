# Loader Service - Dynamic Resource Loading Service

## Giới thiệu

Loader Service là service chuyên dụng để quản lý việc tải động các resources như JavaScript files, CSS stylesheets, images, và các assets khác trong ứng dụng Angular. Service này cung cấp các phương thức để load, cache, và quản lý lifecycle của các external resources.

## Tính năng chính

- **Dynamic Script Loading**: Tải JavaScript files động
- **Stylesheet Loading**: Tải CSS stylesheets động
- **Image Preloading**: Preload images và assets
- **Resource Caching**: Cache loaded resources
- **Loading State Management**: Quản lý trạng thái loading
- **Error Handling**: Xử lý lỗi khi load resources
- **Progress Tracking**: Theo dõi tiến trình loading
- **Dependency Management**: Quản lý dependencies giữa resources
- **Lazy Loading**: Lazy load resources khi cần
- **Resource Cleanup**: Cleanup resources không sử dụng
- **Retry Logic**: Thử lại khi load thất bại
- **Parallel Loading**: Load multiple resources đồng thời

## Phụ thuộc

Service này phụ thuộc vào các Angular modules và services:

```typescript
import { Injectable, Inject, DOCUMENT, Renderer2, RendererFactory2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, forkJoin, of, throwError, timer } from 'rxjs';
import { map, catchError, retry, timeout, switchMap, tap, finalize, share } from 'rxjs/operators';
import { PlatformService } from '../common/platform.service';
import { CacheService } from '../common/cache.service';
```

## Tham chiếu API

### Thuộc tính

| Thuộc tính | Kiểu | Mô tả |
|----------|------|-------|
| `loadingState$` | `Observable<LoadingState>` | Observable cho trạng thái loading |
| `loadingProgress$` | `Observable<LoadingProgress>` | Observable cho tiến trình loading |
| `loadedResources$` | `Observable<LoadedResource[]>` | Observable cho danh sách resources đã load |
| `loadingErrors$` | `Observable<LoadingError[]>` | Observable cho danh sách lỗi loading |
| `isLoading` | `boolean` | Trạng thái loading hiện tại |
| `loadedResourcesCount` | `number` | Số lượng resources đã load |
| `failedResourcesCount` | `number` | Số lượng resources load thất bại |

### Phương thức tải Script

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `loadScript()` | `loadScript(url: string, options?: ScriptLoadOptions): Promise<void>` | Load JavaScript file |
| `loadScripts()` | `loadScripts(urls: string[], options?: ScriptLoadOptions): Promise<void[]>` | Load multiple JavaScript files |
| `loadScriptAsync()` | `loadScriptAsync(url: string, options?: ScriptLoadOptions): Observable<void>` | Load script bất đồng bộ |
| `unloadScript()` | `unloadScript(url: string): void` | Unload JavaScript file |
| `isScriptLoaded()` | `isScriptLoaded(url: string): boolean` | Kiểm tra script đã load |

### Phương thức tải Stylesheet

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `loadStylesheet()` | `loadStylesheet(url: string, options?: StylesheetLoadOptions): Promise<void>` | Load CSS stylesheet |
| `loadStylesheets()` | `loadStylesheets(urls: string[], options?: StylesheetLoadOptions): Promise<void[]>` | Load multiple stylesheets |
| `loadStylesheetAsync()` | `loadStylesheetAsync(url: string, options?: StylesheetLoadOptions): Observable<void>` | Load stylesheet bất đồng bộ |
| `unloadStylesheet()` | `unloadStylesheet(url: string): void` | Unload CSS stylesheet |
| `isStylesheetLoaded()` | `isStylesheetLoaded(url: string): boolean` | Kiểm tra stylesheet đã load |

### Phương thức tải Image

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `preloadImage()` | `preloadImage(url: string, options?: ImageLoadOptions): Promise<HTMLImageElement>` | Preload image |
| `preloadImages()` | `preloadImages(urls: string[], options?: ImageLoadOptions): Promise<HTMLImageElement[]>` | Preload multiple images |
| `loadImageAsync()` | `loadImageAsync(url: string, options?: ImageLoadOptions): Observable<HTMLImageElement>` | Load image bất đồng bộ |
| `getImageDimensions()` | `getImageDimensions(url: string): Promise<ImageDimensions>` | Lấy kích thước image |
| `isImageLoaded()` | `isImageLoaded(url: string): boolean` | Kiểm tra image đã load |

### Phương thức tải Resource tổng quát

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `loadResource()` | `loadResource(url: string, type: ResourceType, options?: ResourceLoadOptions): Promise<any>` | Load generic resource |
| `loadResources()` | `loadResources(resources: ResourceRequest[]): Promise<any[]>` | Load multiple resources |
| `loadResourceAsync()` | `loadResourceAsync(url: string, type: ResourceType, options?: ResourceLoadOptions): Observable<any>` | Load resource bất đồng bộ |
| `preloadResources()` | `preloadResources(urls: string[]): Promise<void>` | Preload multiple resources |
| `getResourceInfo()` | `getResourceInfo(url: string): ResourceInfo | null` | Lấy thông tin resource |

### Phương thức quản lý Cache

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `getCachedResource()` | `getCachedResource(url: string): any | null` | Lấy cached resource |
| `setCachedResource()` | `setCachedResource(url: string, resource: any, options?: CacheOptions): void` | Cache resource |
| `removeCachedResource()` | `removeCachedResource(url: string): void` | Xóa cached resource |
| `clearCache()` | `clearCache(): void` | Xóa toàn bộ cache |
| `getCacheSize()` | `getCacheSize(): number` | Lấy kích thước cache |
| `getCacheStats()` | `getCacheStats(): CacheStats` | Lấy thống kê cache |

### Phương thức trạng thái Loading

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `getLoadingState()` | `getLoadingState(): LoadingState` | Lấy trạng thái loading |
| `getLoadingProgress()` | `getLoadingProgress(): LoadingProgress` | Lấy tiến trình loading |
| `getLoadedResources()` | `getLoadedResources(): LoadedResource[]` | Lấy danh sách resources đã load |
| `getFailedResources()` | `getFailedResources(): LoadingError[]` | Lấy danh sách resources thất bại |
| `resetLoadingState()` | `resetLoadingState(): void` | Reset trạng thái loading |

### Phương thức quản lý Dependency

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `addDependency()` | `addDependency(resource: string, dependency: string): void` | Thêm dependency |
| `removeDependency()` | `removeDependency(resource: string, dependency: string): void` | Xóa dependency |
| `getDependencies()` | `getDependencies(resource: string): string[]` | Lấy dependencies |
| `resolveDependencies()` | `resolveDependencies(resource: string): Promise<void>` | Resolve dependencies |
| `validateDependencies()` | `validateDependencies(): DependencyValidationResult` | Validate dependencies |

### Phương thức tiện ích

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `retryFailedResources()` | `retryFailedResources(): Promise<void>` | Thử lại resources thất bại |
| `cleanupUnusedResources()` | `cleanupUnusedResources(): void` | Cleanup resources không sử dụng |
| `getResourceMetrics()` | `getResourceMetrics(): ResourceMetrics` | Lấy metrics resources |
| `optimizeLoading()` | `optimizeLoading(): void` | Tối ưu hóa loading |
| `prefetchResources()` | `prefetchResources(urls: string[]): void` | Prefetch resources |

## Chi tiết triển khai

### Interfaces

```typescript
interface LoadingState {
  isLoading: boolean;
  totalResources: number;
  loadedResources: number;
  failedResources: number;
  currentResource?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface LoadingProgress {
  percentage: number;
  loaded: number;
  total: number;
  currentResource: string;
  estimatedTimeRemaining?: number;
  averageLoadTime: number;
  loadingSpeed: number;
}

interface LoadedResource {
  url: string;
  type: ResourceType;
  size: number;
  loadTime: number;
  cached: boolean;
  timestamp: number;
  status: 'loaded' | 'failed' | 'loading';
  error?: Error;
}

interface LoadingError {
  url: string;
  type: ResourceType;
  error: Error;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface ScriptLoadOptions {
  async?: boolean;
  defer?: boolean;
  crossOrigin?: string;
  integrity?: string;
  noModule?: boolean;
  referrerPolicy?: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  priority?: 'high' | 'medium' | 'low';
  dependencies?: string[];
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface StylesheetLoadOptions {
  media?: string;
  crossOrigin?: string;
  integrity?: string;
  referrerPolicy?: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  priority?: 'high' | 'medium' | 'low';
  dependencies?: string[];
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface ImageLoadOptions {
  crossOrigin?: string;
  referrerPolicy?: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  priority?: 'high' | 'medium' | 'low';
  lazy?: boolean;
  placeholder?: string;
  onLoad?: (image: HTMLImageElement) => void;
  onError?: (error: Error) => void;
}

interface ResourceLoadOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  priority?: 'high' | 'medium' | 'low';
  headers?: HttpHeaders;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  dependencies?: string[];
  onProgress?: (progress: number) => void;
  onLoad?: (resource: any) => void;
  onError?: (error: Error) => void;
}

interface ResourceRequest {
  url: string;
  type: ResourceType;
  options?: ResourceLoadOptions;
}

interface ResourceInfo {
  url: string;
  type: ResourceType;
  size: number;
  lastModified: number;
  etag?: string;
  contentType: string;
  cached: boolean;
  loadTime: number;
  dependencies: string[];
}

interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  priority?: number;
  persistent?: boolean;
}

interface CacheStats {
  totalSize: number;
  itemCount: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  oldestItem: number;
  newestItem: number;
}

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

interface DependencyValidationResult {
  isValid: boolean;
  circularDependencies: string[][];
  missingDependencies: string[];
  unresolvedDependencies: string[];
}

interface ResourceMetrics {
  totalLoadTime: number;
  averageLoadTime: number;
  fastestLoadTime: number;
  slowestLoadTime: number;
  totalSize: number;
  averageSize: number;
  cacheHitRate: number;
  errorRate: number;
  retryRate: number;
  resourceTypes: Record<ResourceType, number>;
}

type ResourceType = 'script' | 'stylesheet' | 'image' | 'font' | 'json' | 'xml' | 'text' | 'binary';

interface LoaderConfig {
  enableCache: boolean;
  cacheSize: number;
  cacheTTL: number;
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  enableProgressTracking: boolean;
  enableMetrics: boolean;
  enableDependencyManagement: boolean;
  parallelLoadLimit: number;
  enablePrefetch: boolean;
  enableLazyLoading: boolean;
}
```

### Cấu trúc Service

```typescript
import { Injectable, Inject, DOCUMENT, Renderer2, RendererFactory2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, forkJoin, of, throwError, timer } from 'rxjs';
import { map, catchError, retry, timeout, switchMap, tap, finalize, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private readonly _config: LoaderConfig;
  private readonly _renderer: Renderer2;
  
  // State management
  private _loadedResources = new Map<string, LoadedResource>();
  private _loadingPromises = new Map<string, Promise<any>>();
  private _resourceCache = new Map<string, any>();
  private _dependencies = new Map<string, string[]>();
  private _loadingQueue: ResourceRequest[] = [];
  private _activeLoads = new Set<string>();
  
  // Subjects for reactive state
  private _loadingState$ = new BehaviorSubject<LoadingState>({
    isLoading: false,
    totalResources: 0,
    loadedResources: 0,
    failedResources: 0,
    startTime: 0
  });
  private _loadingProgress$ = new BehaviorSubject<LoadingProgress>({
    percentage: 0,
    loaded: 0,
    total: 0,
    currentResource: '',
    averageLoadTime: 0,
    loadingSpeed: 0
  });
  private _loadedResources$ = new BehaviorSubject<LoadedResource[]>([]);
  private _loadingErrors$ = new BehaviorSubject<LoadingError[]>([]);
  
  // Public observables
  public loadingState$ = this._loadingState$.asObservable();
  public loadingProgress$ = this._loadingProgress$.asObservable();
  public loadedResources$ = this._loadedResources$.asObservable();
  public loadingErrors$ = this._loadingErrors$.asObservable();
  
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    private platformService: PlatformService,
    private cacheService: CacheService,
    rendererFactory: RendererFactory2,
    config?: Partial<LoaderConfig>
  ) {
    this._renderer = rendererFactory.createRenderer(null, null);
    this._config = this.mergeConfig(this.getDefaultConfig(), config);
    this.initializeService();
  }

  private getDefaultConfig(): LoaderConfig {
    return {
      enableCache: true,
      cacheSize: 100,
      cacheTTL: 3600000, // 1 hour
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      enableProgressTracking: true,
      enableMetrics: true,
      enableDependencyManagement: true,
      parallelLoadLimit: 6,
      enablePrefetch: true,
      enableLazyLoading: true
    };
  }

  private mergeConfig(defaultConfig: LoaderConfig, userConfig?: Partial<LoaderConfig>): LoaderConfig {
    return { ...defaultConfig, ...userConfig };
  }

  private initializeService(): void {
    if (this._config.enableCache) {
      this.setupCacheCleanup();
    }
    
    if (this._config.enablePrefetch) {
      this.setupPrefetching();
    }
  }

  private setupCacheCleanup(): void {
    // Setup periodic cache cleanup
    setInterval(() => {
      this.cleanupExpiredCache();
    }, this._config.cacheTTL / 4);
  }

  private setupPrefetching(): void {
    // Setup resource prefetching logic
  }

  // Public getters
  get isLoading(): boolean {
    return this._loadingState$.value.isLoading;
  }

  get loadedResourcesCount(): number {
    return this._loadedResources.size;
  }

  get failedResourcesCount(): number {
    return this._loadingErrors$.value.length;
  }

  // Script Loading Methods
  async loadScript(url: string, options: ScriptLoadOptions = {}): Promise<void> {
    if (!this.platformService.isBrowser) {
      return Promise.resolve();
    }
    
    // Check if already loaded
    if (this.isScriptLoaded(url)) {
      return Promise.resolve();
    }
    
    // Check if already loading
    if (this._loadingPromises.has(url)) {
      return this._loadingPromises.get(url)!;
    }
    
    // Check cache
    if (options.cache !== false && this._config.enableCache) {
      const cached = this.getCachedResource(url);
      if (cached) {
        return Promise.resolve();
      }
    }
    
    // Resolve dependencies first
    if (options.dependencies && this._config.enableDependencyManagement) {
      await this.resolveDependencies(url);
    }
    
    const loadPromise = this.createScriptLoadPromise(url, options);
    this._loadingPromises.set(url, loadPromise);
    
    try {
      await loadPromise;
      this.markResourceAsLoaded(url, 'script', options);
    } catch (error) {
      this.handleLoadingError(url, 'script', error, options);
      throw error;
    } finally {
      this._loadingPromises.delete(url);
    }
  }

  async loadScripts(urls: string[], options: ScriptLoadOptions = {}): Promise<void[]> {
    const loadPromises = urls.map(url => this.loadScript(url, options));
    
    if (this._config.parallelLoadLimit > 0) {
      return this.loadInBatches(loadPromises, this._config.parallelLoadLimit);
    }
    
    return Promise.all(loadPromises);
  }

  loadScriptAsync(url: string, options: ScriptLoadOptions = {}): Observable<void> {
    return new Observable(observer => {
      this.loadScript(url, options)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  unloadScript(url: string): void {
    if (!this.platformService.isBrowser) {
      return;
    }
    
    const scripts = this.document.querySelectorAll(`script[src="${url}"]`);
    scripts.forEach(script => {
      script.parentNode?.removeChild(script);
    });
    
    this._loadedResources.delete(url);
    this.removeCachedResource(url);
  }

  isScriptLoaded(url: string): boolean {
    if (!this.platformService.isBrowser) {
      return false;
    }
    
    const script = this.document.querySelector(`script[src="${url}"]`);
    return script !== null;
  }

  // Stylesheet Loading Methods
  async loadStylesheet(url: string, options: StylesheetLoadOptions = {}): Promise<void> {
    if (!this.platformService.isBrowser) {
      return Promise.resolve();
    }
    
    // Check if already loaded
    if (this.isStylesheetLoaded(url)) {
      return Promise.resolve();
    }
    
    // Check if already loading
    if (this._loadingPromises.has(url)) {
      return this._loadingPromises.get(url)!;
    }
    
    // Check cache
    if (options.cache !== false && this._config.enableCache) {
      const cached = this.getCachedResource(url);
      if (cached) {
        return Promise.resolve();
      }
    }
    
    // Resolve dependencies first
    if (options.dependencies && this._config.enableDependencyManagement) {
      await this.resolveDependencies(url);
    }
    
    const loadPromise = this.createStylesheetLoadPromise(url, options);
    this._loadingPromises.set(url, loadPromise);
    
    try {
      await loadPromise;
      this.markResourceAsLoaded(url, 'stylesheet', options);
    } catch (error) {
      this.handleLoadingError(url, 'stylesheet', error, options);
      throw error;
    } finally {
      this._loadingPromises.delete(url);
    }
  }

  async loadStylesheets(urls: string[], options: StylesheetLoadOptions = {}): Promise<void[]> {
    const loadPromises = urls.map(url => this.loadStylesheet(url, options));
    
    if (this._config.parallelLoadLimit > 0) {
      return this.loadInBatches(loadPromises, this._config.parallelLoadLimit);
    }
    
    return Promise.all(loadPromises);
  }

  loadStylesheetAsync(url: string, options: StylesheetLoadOptions = {}): Observable<void> {
    return new Observable(observer => {
      this.loadStylesheet(url, options)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  unloadStylesheet(url: string): void {
    if (!this.platformService.isBrowser) {
      return;
    }
    
    const links = this.document.querySelectorAll(`link[href="${url}"]`);
    links.forEach(link => {
      link.parentNode?.removeChild(link);
    });
    
    this._loadedResources.delete(url);
    this.removeCachedResource(url);
  }

  isStylesheetLoaded(url: string): boolean {
    if (!this.platformService.isBrowser) {
      return false;
    }
    
    const link = this.document.querySelector(`link[href="${url}"]`);
    return link !== null;
  }

  // Image Loading Methods
  async preloadImage(url: string, options: ImageLoadOptions = {}): Promise<HTMLImageElement> {
    // Check cache first
    if (options.cache !== false && this._config.enableCache) {
      const cached = this.getCachedResource(url);
      if (cached) {
        return cached;
      }
    }
    
    // Check if already loading
    if (this._loadingPromises.has(url)) {
      return this._loadingPromises.get(url)!;
    }
    
    const loadPromise = this.createImageLoadPromise(url, options);
    this._loadingPromises.set(url, loadPromise);
    
    try {
      const image = await loadPromise;
      this.markResourceAsLoaded(url, 'image', options);
      
      if (options.cache !== false && this._config.enableCache) {
        this.setCachedResource(url, image);
      }
      
      return image;
    } catch (error) {
      this.handleLoadingError(url, 'image', error, options);
      throw error;
    } finally {
      this._loadingPromises.delete(url);
    }
  }

  async preloadImages(urls: string[], options: ImageLoadOptions = {}): Promise<HTMLImageElement[]> {
    const loadPromises = urls.map(url => this.preloadImage(url, options));
    
    if (this._config.parallelLoadLimit > 0) {
      return this.loadInBatches(loadPromises, this._config.parallelLoadLimit);
    }
    
    return Promise.all(loadPromises);
  }

  loadImageAsync(url: string, options: ImageLoadOptions = {}): Observable<HTMLImageElement> {
    return new Observable(observer => {
      this.preloadImage(url, options)
        .then(image => {
          observer.next(image);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  async getImageDimensions(url: string): Promise<ImageDimensions> {
    const image = await this.preloadImage(url);
    
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      aspectRatio: image.naturalWidth / image.naturalHeight
    };
  }

  isImageLoaded(url: string): boolean {
    return this._loadedResources.has(url) && this._loadedResources.get(url)!.type === 'image';
  }

  // Generic Resource Loading Methods
  async loadResource(url: string, type: ResourceType, options: ResourceLoadOptions = {}): Promise<any> {
    switch (type) {
      case 'script':
        return this.loadScript(url, options as ScriptLoadOptions);
      case 'stylesheet':
        return this.loadStylesheet(url, options as StylesheetLoadOptions);
      case 'image':
        return this.preloadImage(url, options as ImageLoadOptions);
      case 'json':
        return this.loadJsonResource(url, options);
      case 'text':
        return this.loadTextResource(url, options);
      case 'binary':
        return this.loadBinaryResource(url, options);
      default:
        throw new Error(`Unsupported resource type: ${type}`);
    }
  }

  async loadResources(resources: ResourceRequest[]): Promise<any[]> {
    const loadPromises = resources.map(resource => 
      this.loadResource(resource.url, resource.type, resource.options)
    );
    
    if (this._config.parallelLoadLimit > 0) {
      return this.loadInBatches(loadPromises, this._config.parallelLoadLimit);
    }
    
    return Promise.all(loadPromises);
  }

  loadResourceAsync(url: string, type: ResourceType, options: ResourceLoadOptions = {}): Observable<any> {
    return new Observable(observer => {
      this.loadResource(url, type, options)
        .then(resource => {
          observer.next(resource);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  async preloadResources(urls: string[]): Promise<void> {
    const resources = urls.map(url => ({
      url,
      type: this.detectResourceType(url),
      options: { cache: true, priority: 'low' as const }
    }));
    
    await this.loadResources(resources);
  }

  getResourceInfo(url: string): ResourceInfo | null {
    const resource = this._loadedResources.get(url);
    if (!resource) {
      return null;
    }
    
    return {
      url: resource.url,
      type: resource.type,
      size: resource.size,
      lastModified: resource.timestamp,
      contentType: this.getContentType(resource.type),
      cached: resource.cached,
      loadTime: resource.loadTime,
      dependencies: this.getDependencies(url)
    };
  }

  // Cache Management Methods
  getCachedResource(url: string): any | null {
    if (!this._config.enableCache) {
      return null;
    }
    
    const cached = this._resourceCache.get(url);
    if (!cached) {
      return null;
    }
    
    // Check TTL
    if (Date.now() - cached.timestamp > this._config.cacheTTL) {
      this._resourceCache.delete(url);
      return null;
    }
    
    return cached.data;
  }

  setCachedResource(url: string, resource: any, options: CacheOptions = {}): void {
    if (!this._config.enableCache) {
      return;
    }
    
    // Check cache size limit
    if (this._resourceCache.size >= this._config.cacheSize) {
      this.evictOldestCacheEntry();
    }
    
    this._resourceCache.set(url, {
      data: resource,
      timestamp: Date.now(),
      ttl: options.ttl || this._config.cacheTTL,
      priority: options.priority || 1,
      persistent: options.persistent || false
    });
  }

  removeCachedResource(url: string): void {
    this._resourceCache.delete(url);
  }

  clearCache(): void {
    this._resourceCache.clear();
  }

  getCacheSize(): number {
    return this._resourceCache.size;
  }

  getCacheStats(): CacheStats {
    const entries = Array.from(this._resourceCache.values());
    const now = Date.now();
    
    return {
      totalSize: this._resourceCache.size,
      itemCount: entries.length,
      hitRate: 0, // Would need to track hits/misses
      missRate: 0,
      evictionCount: 0, // Would need to track evictions
      oldestItem: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
      newestItem: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0
    };
  }

  // Loading State Methods
  getLoadingState(): LoadingState {
    return this._loadingState$.value;
  }

  getLoadingProgress(): LoadingProgress {
    return this._loadingProgress$.value;
  }

  getLoadedResources(): LoadedResource[] {
    return Array.from(this._loadedResources.values());
  }

  getFailedResources(): LoadingError[] {
    return this._loadingErrors$.value;
  }

  resetLoadingState(): void {
    this._loadingState$.next({
      isLoading: false,
      totalResources: 0,
      loadedResources: 0,
      failedResources: 0,
      startTime: 0
    });
    
    this._loadingProgress$.next({
      percentage: 0,
      loaded: 0,
      total: 0,
      currentResource: '',
      averageLoadTime: 0,
      loadingSpeed: 0
    });
    
    this._loadedResources$.next([]);
    this._loadingErrors$.next([]);
  }

  // Dependency Management Methods
  addDependency(resource: string, dependency: string): void {
    if (!this._dependencies.has(resource)) {
      this._dependencies.set(resource, []);
    }
    
    const deps = this._dependencies.get(resource)!;
    if (!deps.includes(dependency)) {
      deps.push(dependency);
    }
  }

  removeDependency(resource: string, dependency: string): void {
    const deps = this._dependencies.get(resource);
    if (deps) {
      const index = deps.indexOf(dependency);
      if (index > -1) {
        deps.splice(index, 1);
      }
    }
  }

  getDependencies(resource: string): string[] {
    return this._dependencies.get(resource) || [];
  }

  async resolveDependencies(resource: string): Promise<void> {
    const dependencies = this.getDependencies(resource);
    
    if (dependencies.length === 0) {
      return;
    }
    
    // Load dependencies in parallel
    const depPromises = dependencies.map(dep => {
      const type = this.detectResourceType(dep);
      return this.loadResource(dep, type);
    });
    
    await Promise.all(depPromises);
  }

  validateDependencies(): DependencyValidationResult {
    const circularDependencies: string[][] = [];
    const missingDependencies: string[] = [];
    const unresolvedDependencies: string[] = [];
    
    // Check for circular dependencies
    for (const [resource, deps] of this._dependencies) {
      const visited = new Set<string>();
      const path: string[] = [];
      
      if (this.hasCircularDependency(resource, visited, path)) {
        circularDependencies.push([...path]);
      }
    }
    
    // Check for missing dependencies
    for (const [resource, deps] of this._dependencies) {
      for (const dep of deps) {
        if (!this._loadedResources.has(dep) && !this._loadingPromises.has(dep)) {
          missingDependencies.push(dep);
        }
      }
    }
    
    return {
      isValid: circularDependencies.length === 0 && missingDependencies.length === 0,
      circularDependencies,
      missingDependencies,
      unresolvedDependencies
    };
  }

  // Utility Methods
  async retryFailedResources(): Promise<void> {
    const failedResources = this.getFailedResources();
    
    const retryPromises = failedResources
      .filter(error => error.retryCount < error.maxRetries)
      .map(error => {
        const type = error.type;
        return this.loadResource(error.url, type, { retries: 1 });
      });
    
    await Promise.allSettled(retryPromises);
  }

  cleanupUnusedResources(): void {
    // Remove resources that haven't been accessed recently
    const now = Date.now();
    const maxAge = this._config.cacheTTL * 2;
    
    for (const [url, resource] of this._loadedResources) {
      if (now - resource.timestamp > maxAge) {
        this.unloadResource(url, resource.type);
      }
    }
  }

  getResourceMetrics(): ResourceMetrics {
    const resources = this.getLoadedResources();
    const loadTimes = resources.map(r => r.loadTime).filter(t => t > 0);
    const sizes = resources.map(r => r.size).filter(s => s > 0);
    
    const resourceTypes: Record<ResourceType, number> = {
      script: 0,
      stylesheet: 0,
      image: 0,
      font: 0,
      json: 0,
      xml: 0,
      text: 0,
      binary: 0
    };
    
    resources.forEach(resource => {
      resourceTypes[resource.type]++;
    });
    
    return {
      totalLoadTime: loadTimes.reduce((sum, time) => sum + time, 0),
      averageLoadTime: loadTimes.length > 0 ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length : 0,
      fastestLoadTime: loadTimes.length > 0 ? Math.min(...loadTimes) : 0,
      slowestLoadTime: loadTimes.length > 0 ? Math.max(...loadTimes) : 0,
      totalSize: sizes.reduce((sum, size) => sum + size, 0),
      averageSize: sizes.length > 0 ? sizes.reduce((sum, size) => sum + size, 0) / sizes.length : 0,
      cacheHitRate: this.calculateCacheHitRate(),
      errorRate: this.calculateErrorRate(),
      retryRate: this.calculateRetryRate(),
      resourceTypes
    };
  }

  optimizeLoading(): void {
    // Implement loading optimization strategies
    this.cleanupUnusedResources();
    this.optimizeCacheSize();
    this.adjustParallelLoadLimit();
  }

  prefetchResources(urls: string[]): void {
    if (!this._config.enablePrefetch) {
      return;
    }
    
    // Add to prefetch queue
    urls.forEach(url => {
      const type = this.detectResourceType(url);
      this._loadingQueue.push({
        url,
        type,
        options: { priority: 'low', cache: true }
      });
    });
    
    // Process prefetch queue
    this.processPrefetchQueue();
  }

  // Private helper methods
  private createScriptLoadPromise(url: string, options: ScriptLoadOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this._renderer.createElement('script');
      
      // Set script attributes
      this._renderer.setAttribute(script, 'src', url);
      this._renderer.setAttribute(script, 'type', 'text/javascript');
      
      if (options.async) {
        this._renderer.setAttribute(script, 'async', 'true');
      }
      
      if (options.defer) {
        this._renderer.setAttribute(script, 'defer', 'true');
      }
      
      if (options.crossOrigin) {
        this._renderer.setAttribute(script, 'crossorigin', options.crossOrigin);
      }
      
      if (options.integrity) {
        this._renderer.setAttribute(script, 'integrity', options.integrity);
      }
      
      if (options.noModule) {
        this._renderer.setAttribute(script, 'nomodule', 'true');
      }
      
      if (options.referrerPolicy) {
        this._renderer.setAttribute(script, 'referrerpolicy', options.referrerPolicy);
      }
      
      // Set up event handlers
      const onLoad = () => {
        cleanup();
        if (options.onLoad) {
          options.onLoad();
        }
        resolve();
      };
      
      const onError = (error: any) => {
        cleanup();
        const loadError = new Error(`Failed to load script: ${url}`);
        if (options.onError) {
          options.onError(loadError);
        }
        reject(loadError);
      };
      
      const cleanup = () => {
        this._renderer.removeListener(script, 'load', onLoad);
        this._renderer.removeListener(script, 'error', onError);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
      
      this._renderer.listen(script, 'load', onLoad);
      this._renderer.listen(script, 'error', onError);
      
      // Set up timeout
      let timeoutId: any;
      if (options.timeout) {
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error(`Script load timeout: ${url}`));
        }, options.timeout);
      }
      
      // Append to document
      const head = this.document.head || this.document.getElementsByTagName('head')[0];
      this._renderer.appendChild(head, script);
    });
  }

  private createStylesheetLoadPromise(url: string, options: StylesheetLoadOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = this._renderer.createElement('link');
      
      // Set link attributes
      this._renderer.setAttribute(link, 'rel', 'stylesheet');
      this._renderer.setAttribute(link, 'type', 'text/css');
      this._renderer.setAttribute(link, 'href', url);
      
      if (options.media) {
        this._renderer.setAttribute(link, 'media', options.media);
      }
      
      if (options.crossOrigin) {
        this._renderer.setAttribute(link, 'crossorigin', options.crossOrigin);
      }
      
      if (options.integrity) {
        this._renderer.setAttribute(link, 'integrity', options.integrity);
      }
      
      if (options.referrerPolicy) {
        this._renderer.setAttribute(link, 'referrerpolicy', options.referrerPolicy);
      }
      
      // Set up event handlers
      const onLoad = () => {
        cleanup();
        if (options.onLoad) {
          options.onLoad();
        }
        resolve();
      };
      
      const onError = (error: any) => {
        cleanup();
        const loadError = new Error(`Failed to load stylesheet: ${url}`);
        if (options.onError) {
          options.onError(loadError);
        }
        reject(loadError);
      };
      
      const cleanup = () => {
        this._renderer.removeListener(link, 'load', onLoad);
        this._renderer.removeListener(link, 'error', onError);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
      
      this._renderer.listen(link, 'load', onLoad);
      this._renderer.listen(link, 'error', onError);
      
      // Set up timeout
      let timeoutId: any;
      if (options.timeout) {
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error(`Stylesheet load timeout: ${url}`));
        }, options.timeout);
      }
      
      // Append to document
      const head = this.document.head || this.document.getElementsByTagName('head')[0];
      this._renderer.appendChild(head, link);
    });
  }

  private createImageLoadPromise(url: string, options: ImageLoadOptions): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      if (options.crossOrigin) {
        img.crossOrigin = options.crossOrigin;
      }
      
      if (options.referrerPolicy) {
        img.referrerPolicy = options.referrerPolicy;
      }
      
      const onLoad = () => {
        cleanup();
        if (options.onLoad) {
          options.onLoad(img);
        }
        resolve(img);
      };
      
      const onError = () => {
        cleanup();
        const loadError = new Error(`Failed to load image: ${url}`);
        if (options.onError) {
          options.onError(loadError);
        }
        reject(loadError);
      };
      
      const cleanup = () => {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
      
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
      
      // Set up timeout
      let timeoutId: any;
      if (options.timeout) {
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error(`Image load timeout: ${url}`));
        }, options.timeout);
      }
      
      // Start loading
      img.src = url;
    });
  }

  private async loadJsonResource(url: string, options: ResourceLoadOptions): Promise<any> {
    const headers = options.headers || new HttpHeaders();
    
    return this.http.get(url, {
      headers,
      responseType: 'json'
    }).pipe(
      timeout(options.timeout || this._config.timeout),
      retry(options.retries || this._config.maxRetries),
      catchError(error => {
        throw new Error(`Failed to load JSON resource: ${url} - ${error.message}`);
      })
    ).toPromise();
  }

  private async loadTextResource(url: string, options: ResourceLoadOptions): Promise<string> {
    const headers = options.headers || new HttpHeaders();
    
    return this.http.get(url, {
      headers,
      responseType: 'text'
    }).pipe(
      timeout(options.timeout || this._config.timeout),
      retry(options.retries || this._config.maxRetries),
      catchError(error => {
        throw new Error(`Failed to load text resource: ${url} - ${error.message}`);
      })
    ).toPromise();
  }

  private async loadBinaryResource(url: string, options: ResourceLoadOptions): Promise<ArrayBuffer> {
    const headers = options.headers || new HttpHeaders();
    
    return this.http.get(url, {
      headers,
      responseType: 'arraybuffer'
    }).pipe(
      timeout(options.timeout || this._config.timeout),
      retry(options.retries || this._config.maxRetries),
      catchError(error => {
        throw new Error(`Failed to load binary resource: ${url} - ${error.message}`);
      })
    ).toPromise();
  }

  private async loadInBatches<T>(promises: Promise<T>[], batchSize: number): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < promises.length; i += batchSize) {
      const batch = promises.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }
    
    return results;
  }

  private markResourceAsLoaded(url: string, type: ResourceType, options: any): void {
    const resource: LoadedResource = {
      url,
      type,
      size: 0, // Would need to calculate actual size
      loadTime: 0, // Would need to track load time
      cached: false,
      timestamp: Date.now(),
      status: 'loaded'
    };
    
    this._loadedResources.set(url, resource);
    this.updateLoadingState();
  }

  private handleLoadingError(url: string, type: ResourceType, error: Error, options: any): void {
    const loadingError: LoadingError = {
      url,
      type,
      error,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.retries || this._config.maxRetries
    };
    
    const currentErrors = this._loadingErrors$.value;
    this._loadingErrors$.next([...currentErrors, loadingError]);
    
    this.updateLoadingState();
  }

  private updateLoadingState(): void {
    const state = this._loadingState$.value;
    const loadedCount = this._loadedResources.size;
    const failedCount = this._loadingErrors$.value.length;
    
    this._loadingState$.next({
      ...state,
      loadedResources: loadedCount,
      failedResources: failedCount,
      isLoading: this._activeLoads.size > 0
    });
  }

  private detectResourceType(url: string): ResourceType {
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'mjs':
        return 'script';
      case 'css':
        return 'stylesheet';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return 'image';
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'otf':
        return 'font';
      case 'json':
        return 'json';
      case 'xml':
        return 'xml';
      case 'txt':
      case 'md':
        return 'text';
      default:
        return 'binary';
    }
  }

  private getContentType(type: ResourceType): string {
    switch (type) {
      case 'script':
        return 'application/javascript';
      case 'stylesheet':
        return 'text/css';
      case 'image':
        return 'image/*';
      case 'font':
        return 'font/*';
      case 'json':
        return 'application/json';
      case 'xml':
        return 'application/xml';
      case 'text':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  private hasCircularDependency(resource: string, visited: Set<string>, path: string[]): boolean {
    if (visited.has(resource)) {
      return true;
    }
    
    visited.add(resource);
    path.push(resource);
    
    const dependencies = this.getDependencies(resource);
    for (const dep of dependencies) {
      if (this.hasCircularDependency(dep, visited, path)) {
        return true;
      }
    }
    
    visited.delete(resource);
    path.pop();
    
    return false;
  }

  private evictOldestCacheEntry(): void {
    let oldestUrl = '';
    let oldestTime = Date.now();
    
    for (const [url, cached] of this._resourceCache) {
      if (cached.timestamp < oldestTime && !cached.persistent) {
        oldestTime = cached.timestamp;
        oldestUrl = url;
      }
    }
    
    if (oldestUrl) {
      this._resourceCache.delete(oldestUrl);
    }
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    
    for (const [url, cached] of this._resourceCache) {
      if (now - cached.timestamp > cached.ttl && !cached.persistent) {
        this._resourceCache.delete(url);
      }
    }
  }

  private unloadResource(url: string, type: ResourceType): void {
    switch (type) {
      case 'script':
        this.unloadScript(url);
        break;
      case 'stylesheet':
        this.unloadStylesheet(url);
        break;
      default:
        // For other types, just remove from loaded resources
        this._loadedResources.delete(url);
        break;
    }
  }

  private calculateCacheHitRate(): number {
    // Would need to track cache hits and misses
    return 0;
  }

  private calculateErrorRate(): number {
    const totalResources = this._loadedResources.size + this._loadingErrors$.value.length;
    if (totalResources === 0) {
      return 0;
    }
    return this._loadingErrors$.value.length / totalResources;
  }

  private calculateRetryRate(): number {
    // Would need to track retry attempts
    return 0;
  }

  private optimizeCacheSize(): void {
    // Implement cache size optimization
    if (this._resourceCache.size > this._config.cacheSize * 0.8) {
      // Remove least recently used items
      const entries = Array.from(this._resourceCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, Math.floor(this._config.cacheSize * 0.2));
      
      entries.forEach(([url]) => {
        this._resourceCache.delete(url);
      });
    }
  }

  private adjustParallelLoadLimit(): void {
    // Dynamically adjust parallel load limit based on performance
    const metrics = this.getResourceMetrics();
    
    if (metrics.averageLoadTime > 5000) {
      // Reduce parallel loads if average load time is high
      this._config.parallelLoadLimit = Math.max(2, this._config.parallelLoadLimit - 1);
    } else if (metrics.averageLoadTime < 1000) {
      // Increase parallel loads if average load time is low
      this._config.parallelLoadLimit = Math.min(10, this._config.parallelLoadLimit + 1);
    }
  }

  private processPrefetchQueue(): void {
    if (this._loadingQueue.length === 0 || this._activeLoads.size >= this._config.parallelLoadLimit) {
      return;
    }
    
    const resource = this._loadingQueue.shift();
    if (resource) {
      this.loadResource(resource.url, resource.type, resource.options)
        .then(() => {
          this.processPrefetchQueue();
        })
        .catch(() => {
          this.processPrefetchQueue();
        });
    }
  }
}
```

## Cách sử dụng

### Tải Resource cơ bản

```typescript
import { Component, OnInit } from '@angular/core';
import { LoaderService } from '@cci-web/core/services';

@Component({
  selector: 'app-resource-loader',
  template: `
    <div class="loading-container" *ngIf="isLoading">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          [style.width.%]="loadingProgress.percentage">
        </div>
      </div>
      <p>Loading: {{ loadingProgress.currentResource }}</p>
      <small>{{ loadingProgress.loaded }} / {{ loadingProgress.total }} resources loaded</small>
    </div>
    
    <div class="content" *ngIf="!isLoading">
      <h2>Resources Loaded Successfully!</h2>
      <button (click)="loadAdditionalResources()">Load More Resources</button>
    </div>
    
    <div class="error-list" *ngIf="loadingErrors.length > 0">
      <h3>Loading Errors:</h3>
      <ul>
        <li *ngFor="let error of loadingErrors">
          {{ error.url }}: {{ error.error.message }}
        </li>
      </ul>
      <button (click)="retryFailedResources()">Retry Failed</button>
    </div>
  `,
  styles: [`
    .loading-container {
      padding: 2rem;
      text-align: center;
    }
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin: 1rem 0;
    }
    
    .progress-fill {
      height: 100%;
      background: #007bff;
      transition: width 0.3s ease;
    }
    
    .error-list {
      margin-top: 2rem;
      padding: 1rem;
      background: #fff5f5;
      border: 1px solid #fed7d7;
      border-radius: 4px;
    }
  `]
})
export class ResourceLoaderComponent implements OnInit {
  isLoading = false;
  loadingProgress: any = { percentage: 0, loaded: 0, total: 0, currentResource: '' };
  loadingErrors: any[] = [];

  constructor(private loaderService: LoaderService) {}

  ngOnInit(): void {
    // Subscribe to loading state
    this.loaderService.loadingState$.subscribe(state => {
      this.isLoading = state.isLoading;
    });
    
    this.loaderService.loadingProgress$.subscribe(progress => {
      this.loadingProgress = progress;
    });
    
    this.loaderService.loadingErrors$.subscribe(errors => {
      this.loadingErrors = errors;
    });
    
    // Load initial resources
    this.loadInitialResources();
  }

  private async loadInitialResources(): Promise<void> {
    try {
      // Load scripts
      await this.loaderService.loadScripts([
        '/assets/js/vendor/jquery.min.js',
        '/assets/js/vendor/bootstrap.min.js',
        '/assets/js/app.js'
      ]);
      
      // Load stylesheets
      await this.loaderService.loadStylesheets([
        '/assets/css/vendor/bootstrap.min.css',
        '/assets/css/app.css',
        '/assets/css/themes/default.css'
      ]);
      
      // Preload images
      await this.loaderService.preloadImages([
        '/assets/images/logo.png',
        '/assets/images/hero-bg.jpg',
        '/assets/images/icons/sprite.svg'
      ]);
      
      console.log('All initial resources loaded successfully');
      
    } catch (error) {
      console.error('Failed to load initial resources:', error);
    }
  }

  async loadAdditionalResources(): Promise<void> {
    try {
      // Load additional resources dynamically
      const resources = [
        { url: '/assets/js/modules/charts.js', type: 'script' as const },
        { url: '/assets/css/modules/charts.css', type: 'stylesheet' as const },
        { url: '/assets/data/chart-data.json', type: 'json' as const }
      ];
      
      await this.loaderService.loadResources(resources);
      
      console.log('Additional resources loaded successfully');
      
    } catch (error) {
      console.error('Failed to load additional resources:', error);
    }
  }

  async retryFailedResources(): Promise<void> {
    try {
      await this.loaderService.retryFailedResources();
      console.log('Retry completed');
    } catch (error) {
      console.error('Retry failed:', error);
    }
  }
}
```

### Tải Resource nâng cao với Dependencies

```typescript
import { Injectable } from '@angular/core';
import { LoaderService } from '@cci-web/core/services';

@Injectable({
  providedIn: 'root'
})
export class AdvancedResourceService {
  constructor(private loaderService: LoaderService) {
    this.setupDependencies();
  }

  private setupDependencies(): void {
    // Setup resource dependencies
    this.loaderService.addDependency('/assets/js/app.js', '/assets/js/vendor/jquery.min.js');
    this.loaderService.addDependency('/assets/js/modules/charts.js', '/assets/js/vendor/d3.min.js');
    this.loaderService.addDependency('/assets/css/app.css', '/assets/css/vendor/normalize.css');
  }

  async loadWithDependencies(): Promise<void> {
    try {
      // Load script with dependencies - dependencies will be loaded first
      await this.loaderService.loadScript('/assets/js/app.js', {
        dependencies: ['/assets/js/vendor/jquery.min.js'],
        async: true,
        cache: true,
        priority: 'high',
        onLoad: () => console.log('App script loaded'),
        onError: (error) => console.error('App script failed:', error)
      });
      
      // Load stylesheet with dependencies
      await this.loaderService.loadStylesheet('/assets/css/app.css', {
        dependencies: ['/assets/css/vendor/normalize.css'],
        media: 'screen',
        cache: true,
        priority: 'high'
      });
      
      console.log('Resources with dependencies loaded successfully');
      
    } catch (error) {
      console.error('Failed to load resources with dependencies:', error);
    }
  }

  async loadResourcesInBatches(): Promise<void> {
    const resources = [
      { url: '/assets/js/module1.js', type: 'script' as const },
      { url: '/assets/js/module2.js', type: 'script' as const },
      { url: '/assets/js/module3.js', type: 'script' as const },
      { url: '/assets/css/module1.css', type: 'stylesheet' as const },
      { url: '/assets/css/module2.css', type: 'stylesheet' as const },
      { url: '/assets/images/gallery1.jpg', type: 'image' as const },
      { url: '/assets/images/gallery2.jpg', type: 'image' as const },
      { url: '/assets/images/gallery3.jpg', type: 'image' as const }
    ];
    
    try {
      // Load resources in batches (parallel loading with limit)
      await this.loaderService.loadResources(resources);
      
      console.log('Batch loading completed');
      
    } catch (error) {
      console.error('Batch loading failed:', error);
    }
  }

  monitorLoadingProgress(): void {
    this.loaderService.loadingProgress$.subscribe(progress => {
      console.log(`Loading progress: ${progress.percentage}%`);
      console.log(`Current resource: ${progress.currentResource}`);
      console.log(`Average load time: ${progress.averageLoadTime}ms`);
      
      if (progress.estimatedTimeRemaining) {
        console.log(`Estimated time remaining: ${progress.estimatedTimeRemaining}ms`);
      }
    });
  }

  async preloadCriticalResources(): Promise<void> {
    // Preload critical resources for better performance
    const criticalResources = [
      '/assets/css/critical.css',
      '/assets/js/critical.js',
      '/assets/images/above-fold.jpg',
      '/assets/fonts/primary-font.woff2'
    ];
    
    try {
      await this.loaderService.preloadResources(criticalResources);
      console.log('Critical resources preloaded');
    } catch (error) {
      console.error('Failed to preload critical resources:', error);
    }
  }

  async loadConditionalResources(): Promise<void> {
    // Load resources based on conditions
    const userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isModernBrowser = 'fetch' in window && 'Promise' in window;
    
    try {
      if (isMobile) {
        await this.loaderService.loadStylesheet('/assets/css/mobile.css');
        await this.loaderService.loadScript('/assets/js/mobile.js');
      } else {
        await this.loaderService.loadStylesheet('/assets/css/desktop.css');
        await this.loaderService.loadScript('/assets/js/desktop.js');
      }
      
      if (!isModernBrowser) {
        await this.loaderService.loadScript('/assets/js/polyfills.js');
      }
      
      console.log('Conditional resources loaded');
      
    } catch (error) {
      console.error('Failed to load conditional resources:', error);
    }
  }
}
```

### Image Loading with Lazy Loading

```typescript
import { Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { LoaderService } from '@cci-web/core/services';

@Component({
  selector: 'app-image-gallery',
  template: `
    <div class="gallery">
      <div 
        *ngFor="let image of images; trackBy: trackByUrl" 
        class="image-container"
        #imageContainer>
        <img 
          [src]="image.loaded ? image.url : image.placeholder"
          [alt]="image.alt"
          [class.loaded]="image.loaded"
          [class.loading]="image.loading"
          [class.error]="image.error"
          (load)="onImageLoad(image)"
          (error)="onImageError(image)">
        <div *ngIf="image.loading" class="loading-spinner"></div>
        <div *ngIf="image.error" class="error-message">Failed to load image</div>
      </div>
    </div>
  `,
  styles: [`
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }
    
    .image-container {
      position: relative;
      aspect-ratio: 16/9;
      overflow: hidden;
      border-radius: 8px;
      background: #f5f5f5;
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
      opacity: 0;
    }
    
    img.loaded {
      opacity: 1;
    }
    
    .loading-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    .error-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #dc3545;
      font-size: 0.875rem;
      text-align: center;
    }
  `]
})
export class ImageGalleryComponent implements OnInit {
  @ViewChildren('imageContainer') imageContainers!: QueryList<ElementRef>;
  
  images = [
    {
      url: '/assets/images/gallery/image1.jpg',
      placeholder: '/assets/images/placeholder.svg',
      alt: 'Gallery Image 1',
      loaded: false,
      loading: false,
      error: false
    },
    {
      url: '/assets/images/gallery/image2.jpg',
      placeholder: '/assets/images/placeholder.svg',
      alt: 'Gallery Image 2',
      loaded: false,
      loading: false,
      error: false
    },
    // ... more images
  ];
  
  private intersectionObserver!: IntersectionObserver;

  constructor(private loaderService: LoaderService) {}

  ngOnInit(): void {
    this.setupLazyLoading();
  }

  ngAfterViewInit(): void {
    this.observeImages();
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  private setupLazyLoading(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            this.loadImage(index);
            this.intersectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );
  }

  private observeImages(): void {
    this.imageContainers.forEach((container, index) => {
      container.nativeElement.setAttribute('data-index', index.toString());
      this.intersectionObserver.observe(container.nativeElement);
    });
  }

  private async loadImage(index: number): Promise<void> {
    const image = this.images[index];
    if (image.loaded || image.loading) {
      return;
    }
    
    image.loading = true;
    
    try {
      await this.loaderService.preloadImage(image.url, {
        lazy: true,
        cache: true,
        timeout: 10000,
        onLoad: (img) => {
          console.log(`Image loaded: ${image.url}`, {
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        }
      });
      
      image.loaded = true;
      image.loading = false;
      
    } catch (error) {
      console.error(`Failed to load image: ${image.url}`, error);
      image.error = true;
      image.loading = false;
    }
  }

  onImageLoad(image: any): void {
    image.loaded = true;
    image.loading = false;
    image.error = false;
  }

  onImageError(image: any): void {
    image.error = true;
    image.loading = false;
    image.loaded = false;
  }

  trackByUrl(index: number, image: any): string {
    return image.url;
  }

  async retryFailedImages(): Promise<void> {
    const failedImages = this.images.filter(img => img.error);
    
    for (const image of failedImages) {
      image.error = false;
      image.loading = true;
      
      try {
        await this.loaderService.preloadImage(image.url, { retries: 2 });
        image.loaded = true;
        image.loading = false;
      } catch (error) {
        image.error = true;
        image.loading = false;
      }
    }
  }
}
```

## Thực hành tốt nhất

### 1. Resource Loading Strategy

```typescript
// ✅ Good: Structured loading strategy
class GoodResourceStrategy {
  async loadResources(): Promise<void> {
    // 1. Load critical resources first
    await this.loadCriticalResources();
    
    // 2. Load essential resources
    await this.loadEssentialResources();
    
    // 3. Preload non-critical resources
    this.preloadNonCriticalResources();
  }

  private async loadCriticalResources(): Promise<void> {
    const criticalResources = [
      { url: '/assets/css/critical.css', type: 'stylesheet' as const, priority: 'high' as const },
      { url: '/assets/js/critical.js', type: 'script' as const, priority: 'high' as const }
    ];
    
    await this.loaderService.loadResources(criticalResources);
  }

  private async loadEssentialResources(): Promise<void> {
    const essentialResources = [
      { url: '/assets/js/app.js', type: 'script' as const, priority: 'medium' as const },
      { url: '/assets/css/app.css', type: 'stylesheet' as const, priority: 'medium' as const }
    ];
    
    await this.loaderService.loadResources(essentialResources);
  }

  private preloadNonCriticalResources(): void {
    const nonCriticalResources = [
      '/assets/images/hero-bg.jpg',
      '/assets/js/analytics.js',
      '/assets/css/animations.css'
    ];
    
    // Preload without blocking
    this.loaderService.prefetchResources(nonCriticalResources);
  }
}

// ❌ Bad: Loading everything at once
class BadResourceStrategy {
  async loadResources(): Promise<void> {
    // Loading everything at once without prioritization
    const allResources = [
      '/assets/js/vendor/jquery.js',
      '/assets/js/vendor/bootstrap.js',
      '/assets/js/app.js',
      '/assets/css/vendor/bootstrap.css',
      '/assets/css/app.css',
      '/assets/images/hero.jpg',
      '/assets/images/gallery1.jpg',
      '/assets/images/gallery2.jpg'
      // ... many more resources
    ];
    
    // This will overwhelm the browser and slow down initial load
    await Promise.all(allResources.map(url => 
      this.loaderService.loadResource(url, this.detectType(url))
    ));
  }
}
```

### 2. Error Handling and Retry Logic

```typescript
// ✅ Good: Comprehensive error handling
class GoodErrorHandling {
  async loadResourceWithRetry(url: string, type: ResourceType): Promise<any> {
    const maxRetries = 3;
    const retryDelay = 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.loaderService.loadResource(url, type, {
          timeout: 10000,
          retries: 0, // Handle retries manually for better control
          onError: (error) => {
            console.warn(`Attempt ${attempt} failed for ${url}:`, error.message);
          }
        });
      } catch (error) {
        if (attempt === maxRetries) {
          // Log final failure
          console.error(`Failed to load ${url} after ${maxRetries} attempts:`, error);
          
          // Try fallback resource if available
          const fallbackUrl = this.getFallbackUrl(url);
          if (fallbackUrl) {
            try {
              return await this.loaderService.loadResource(fallbackUrl, type);
            } catch (fallbackError) {
              console.error(`Fallback also failed for ${url}:`, fallbackError);
            }
          }
          
          throw error;
        }
        
        // Wait before retry with exponential backoff
        await this.delay(retryDelay * Math.pow(2, attempt - 1));
      }
    }
  }

  private getFallbackUrl(url: string): string | null {
    // Define fallback URLs for critical resources
    const fallbacks: Record<string, string> = {
      '/assets/js/app.js': '/assets/js/app.min.js',
      '/assets/css/app.css': '/assets/css/app.min.css',
      '/assets/images/hero.jpg': '/assets/images/hero-fallback.jpg'
    };
    
    return fallbacks[url] || null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 3. Performance Optimization

```typescript
// ✅ Good: Performance-optimized loading
class PerformanceOptimizedLoader {
  constructor(private loaderService: LoaderService) {
    this.setupPerformanceOptimizations();
  }

  private setupPerformanceOptimizations(): void {
    // Monitor performance metrics
    this.loaderService.loadingProgress$.subscribe(progress => {
      if (progress.averageLoadTime > 3000) {
        console.warn('Slow loading detected, optimizing...');
        this.optimizeLoading();
      }
    });
    
    // Setup resource prefetching based on user behavior
    this.setupIntelligentPrefetching();
  }

  private optimizeLoading(): void {
    // Reduce parallel load limit if loading is slow
    this.loaderService.optimizeLoading();
    
    // Clear unused cache entries
    this.loaderService.cleanupUnusedResources();
    
    // Prioritize critical resources
    this.adjustResourcePriorities();
  }

  private setupIntelligentPrefetching(): void {
    // Prefetch resources based on user navigation patterns
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && this.shouldPrefetch(link.href)) {
        this.prefetchPageResources(link.href);
      }
    });
  }

  private shouldPrefetch(href: string): boolean {
    // Only prefetch internal links
    return href.startsWith(window.location.origin) && 
           !href.includes('#') && 
           !href.includes('?');
  }

  private prefetchPageResources(href: string): void {
    // Prefetch resources that might be needed for the target page
    const potentialResources = this.getPotentialResourcesForPage(href);
    this.loaderService.prefetchResources(potentialResources);
  }

  private getPotentialResourcesForPage(href: string): string[] {
    // Logic to determine what resources might be needed
    const basePath = href.split('/').slice(0, -1).join('/');
    return [
      `${basePath}/page.css`,
      `${basePath}/page.js`,
      `${basePath}/images/hero.jpg`
    ];
  }

  private adjustResourcePriorities(): void {
    // Adjust loading priorities based on current performance
    const metrics = this.loaderService.getResourceMetrics();
    
    if (metrics.errorRate > 0.1) {
      // High error rate - reduce concurrent loads
      console.log('High error rate detected, reducing concurrent loads');
    }
    
    if (metrics.averageLoadTime > 5000) {
      // Slow loading - prioritize critical resources only
      console.log('Slow loading detected, prioritizing critical resources');
    }
  }
}
```

## Cân nhắc về hiệu suất

### 1. Loading Optimization
- Prioritize critical resources và load non-critical resources sau
- Sử dụng parallel loading với reasonable limits
- Implement intelligent caching strategies
- Monitor loading performance và adjust accordingly

### 2. Memory Management
- Clean up unused resources regularly
- Implement cache size limits
- Use weak references cho cached resources
- Monitor memory usage và optimize cache

### 3. Network Optimization
- Use appropriate timeout values
- Implement retry logic với exponential backoff
- Batch similar requests khi có thể
- Use compression và caching headers

## Khắc phục sự cố

### Common Issues

**1. Resource Loading Timeout**
```typescript
// Increase timeout for slow networks
const options = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 2000
};
```

**2. CORS Issues**
```typescript
// Handle CORS for external resources
const options = {
  crossOrigin: 'anonymous',
  referrerPolicy: 'no-referrer'
};
```

**3. Cache Issues**
```typescript
// Clear cache if resources are stale
this.loaderService.clearCache();
// Or remove specific cached resource
this.loaderService.removeCachedResource(url);
```

## Phụ thuộc

- `@angular/core`: Angular framework
- `@angular/common/http`: HTTP client
- `rxjs`: Reactive programming
- `PlatformService`: Platform detection
- `CacheService`: Caching functionality

## Related Services

- **CacheService**: Resource caching
- **PlatformService**: Platform detection
- **AppInitializeService**: Application initialization
- **ConfigService**: Configuration management