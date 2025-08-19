# Platform Service - Platform Detection Service

## Giới thiệu

Platform Service là service cốt lõi để phát hiện môi trường chạy của ứng dụng Angular (browser hoặc server-side rendering). Service này cung cấp các phương thức an toàn để truy cập các đối tượng global như `window`, `document`, `localStorage`, và `sessionStorage` mà không gây lỗi trong môi trường SSR.

## Tính năng chính

- **Platform Detection**: Phát hiện môi trường browser vs server
- **Safe Global Access**: Truy cập an toàn đến window, document objects
- **Storage Access**: localStorage và sessionStorage với SSR support
- **Type Safety**: Full TypeScript support với proper typing
- **SSR Compatible**: Hoạt động tốt trong cả browser và server environments
- **Null Safety**: Tránh errors khi objects không tồn tại
- **Performance Optimized**: Cached platform detection

## Phụ thuộc

Service này phụ thuộc vào các Angular core modules:

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
```

## Tham chiếu API

### Thuộc tính

| Thuộc tính | Kiểu | Mô tả |
|----------|------|-------|
| `isBrowser` | `boolean` | True nếu đang chạy trong browser |
| `isServer` | `boolean` | True nếu đang chạy trong server |
| `window` | `Window \| null` | Window object (null trong SSR) |
| `document` | `Document \| null` | Document object (null trong SSR) |
| `localStorage` | `Storage \| null` | LocalStorage (null trong SSR) |
| `sessionStorage` | `Storage \| null` | SessionStorage (null trong SSR) |

### Phương thức

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `getWindow()` | `getWindow(): Window \| null` | Lấy window object an toàn |
| `getDocument()` | `getDocument(): Document \| null` | Lấy document object an toàn |
| `getLocalStorage()` | `getLocalStorage(): Storage \| null` | Lấy localStorage an toàn |
| `getSessionStorage()` | `getSessionStorage(): Storage \| null` | Lấy sessionStorage an toàn |
| `isWindowAvailable()` | `isWindowAvailable(): boolean` | Kiểm tra window có sẵn |
| `isDocumentAvailable()` | `isDocumentAvailable(): boolean` | Kiểm tra document có sẵn |
| `isStorageAvailable()` | `isStorageAvailable(): boolean` | Kiểm tra storage có sẵn |

## Chi tiết triển khai

### Service Structure

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  private _isBrowser: boolean;
  private _window: Window | null = null;
  private _document: Document | null = null;
  private _localStorage: Storage | null = null;
  private _sessionStorage: Storage | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
    this.initializePlatformObjects();
  }

  private initializePlatformObjects(): void {
    if (this._isBrowser) {
      this._window = window;
      this._document = this.document;
      
      try {
        this._localStorage = window.localStorage;
        this._sessionStorage = window.sessionStorage;
      } catch (error) {
        // Storage might be disabled in some browsers
        console.warn('Storage not available:', error);
        this._localStorage = null;
        this._sessionStorage = null;
      }
    }
  }

  // Getters
  get isBrowser(): boolean {
    return this._isBrowser;
  }

  get isServer(): boolean {
    return !this._isBrowser;
  }

  get window(): Window | null {
    return this._window;
  }

  get document(): Document | null {
    return this._document;
  }

  get localStorage(): Storage | null {
    return this._localStorage;
  }

  get sessionStorage(): Storage | null {
    return this._sessionStorage;
  }

  // Methods
  getWindow(): Window | null {
    return this._window;
  }

  getDocument(): Document | null {
    return this._document;
  }

  getLocalStorage(): Storage | null {
    return this._localStorage;
  }

  getSessionStorage(): Storage | null {
    return this._sessionStorage;
  }

  isWindowAvailable(): boolean {
    return this._window !== null;
  }

  isDocumentAvailable(): boolean {
    return this._document !== null;
  }

  isStorageAvailable(): boolean {
    return this._localStorage !== null && this._sessionStorage !== null;
  }
}
```

### Platform Detection Logic

```typescript
private initializePlatformObjects(): void {
  if (this._isBrowser) {
    // Browser environment
    this._window = window;
    this._document = this.document;
    
    // Safe storage initialization
    try {
      // Test storage availability
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      
      this._localStorage = window.localStorage;
      this._sessionStorage = window.sessionStorage;
    } catch (error) {
      // Storage might be disabled (private browsing, etc.)
      console.warn('Storage not available:', error);
      this._localStorage = null;
      this._sessionStorage = null;
    }
  } else {
    // Server environment - all objects are null
    this._window = null;
    this._document = null;
    this._localStorage = null;
    this._sessionStorage = null;
  }
}
```

## Cách sử dụng

### Basic Platform Detection

```typescript
import { Component, OnInit } from '@angular/core';
import { PlatformService } from '@cci-web/core';

@Component({
  selector: 'app-platform-aware',
  template: `
    <div class="platform-info">
      <h2>Platform Information</h2>
      <p>Running in: {{ platformInfo }}</p>
      <p>Window available: {{ windowAvailable }}</p>
      <p>Storage available: {{ storageAvailable }}</p>
      
      <div *ngIf="isBrowser">
        <h3>Browser-only Content</h3>
        <p>Current URL: {{ currentUrl }}</p>
        <p>User Agent: {{ userAgent }}</p>
      </div>
      
      <div *ngIf="isServer">
        <h3>Server-side Rendering</h3>
        <p>This content is rendered on the server</p>
      </div>
    </div>
  `
})
export class PlatformAwareComponent implements OnInit {
  platformInfo: string;
  windowAvailable: boolean;
  storageAvailable: boolean;
  currentUrl: string = '';
  userAgent: string = '';

  constructor(private platformService: PlatformService) {}

  ngOnInit() {
    // Platform detection
    this.platformInfo = this.platformService.isBrowser ? 'Browser' : 'Server';
    this.windowAvailable = this.platformService.isWindowAvailable();
    this.storageAvailable = this.platformService.isStorageAvailable();

    // Browser-specific operations
    if (this.platformService.isBrowser) {
      const window = this.platformService.getWindow();
      if (window) {
        this.currentUrl = window.location.href;
        this.userAgent = window.navigator.userAgent;
      }
    }
  }

  get isBrowser(): boolean {
    return this.platformService.isBrowser;
  }

  get isServer(): boolean {
    return this.platformService.isServer;
  }
}
```

### Safe Storage Operations

```typescript
import { Injectable } from '@angular/core';
import { PlatformService } from '@cci-web/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private platformService: PlatformService) {}

  // LocalStorage operations
  setItem(key: string, value: any): boolean {
    const localStorage = this.platformService.getLocalStorage();
    if (localStorage) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
      }
    }
    return false;
  }

  getItem<T>(key: string, defaultValue?: T): T | null {
    const localStorage = this.platformService.getLocalStorage();
    if (localStorage) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue || null;
      } catch (error) {
        console.error('Failed to read from localStorage:', error);
        return defaultValue || null;
      }
    }
    return defaultValue || null;
  }

  removeItem(key: string): boolean {
    const localStorage = this.platformService.getLocalStorage();
    if (localStorage) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Failed to remove from localStorage:', error);
        return false;
      }
    }
    return false;
  }

  clear(): boolean {
    const localStorage = this.platformService.getLocalStorage();
    if (localStorage) {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('Failed to clear localStorage:', error);
        return false;
      }
    }
    return false;
  }

  // SessionStorage operations
  setSessionItem(key: string, value: any): boolean {
    const sessionStorage = this.platformService.getSessionStorage();
    if (sessionStorage) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Failed to save to sessionStorage:', error);
        return false;
      }
    }
    return false;
  }

  getSessionItem<T>(key: string, defaultValue?: T): T | null {
    const sessionStorage = this.platformService.getSessionStorage();
    if (sessionStorage) {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue || null;
      } catch (error) {
        console.error('Failed to read from sessionStorage:', error);
        return defaultValue || null;
      }
    }
    return defaultValue || null;
  }

  removeSessionItem(key: string): boolean {
    const sessionStorage = this.platformService.getSessionStorage();
    if (sessionStorage) {
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Failed to remove from sessionStorage:', error);
        return false;
      }
    }
    return false;
  }
}
```

### DOM Manipulation Service

```typescript
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { PlatformService } from '@cci-web/core';

@Injectable({
  providedIn: 'root'
})
export class DomService {
  private renderer: Renderer2;

  constructor(
    private platformService: PlatformService,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  // Safe document operations
  getElementById(id: string): HTMLElement | null {
    const document = this.platformService.getDocument();
    return document ? document.getElementById(id) : null;
  }

  querySelector(selector: string): Element | null {
    const document = this.platformService.getDocument();
    return document ? document.querySelector(selector) : null;
  }

  querySelectorAll(selector: string): NodeListOf<Element> | null {
    const document = this.platformService.getDocument();
    return document ? document.querySelectorAll(selector) : null;
  }

  // Safe window operations
  getWindowSize(): { width: number; height: number } | null {
    const window = this.platformService.getWindow();
    if (window) {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
    return null;
  }

  scrollTo(x: number, y: number): void {
    const window = this.platformService.getWindow();
    if (window) {
      window.scrollTo(x, y);
    }
  }

  // Dynamic script loading
  loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.platformService.isBrowser) {
        resolve(); // Skip in SSR
        return;
      }

      const document = this.platformService.getDocument();
      if (!document) {
        reject(new Error('Document not available'));
        return;
      }

      const script = this.renderer.createElement('script');
      this.renderer.setAttribute(script, 'src', src);
      this.renderer.setAttribute(script, 'type', 'text/javascript');
      
      this.renderer.listen(script, 'load', () => resolve());
      this.renderer.listen(script, 'error', () => reject(new Error(`Failed to load script: ${src}`)));
      
      this.renderer.appendChild(document.head, script);
    });
  }

  // Dynamic CSS loading
  loadStylesheet(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.platformService.isBrowser) {
        resolve(); // Skip in SSR
        return;
      }

      const document = this.platformService.getDocument();
      if (!document) {
        reject(new Error('Document not available'));
        return;
      }

      const link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'stylesheet');
      this.renderer.setAttribute(link, 'href', href);
      
      this.renderer.listen(link, 'load', () => resolve());
      this.renderer.listen(link, 'error', () => reject(new Error(`Failed to load stylesheet: ${href}`)));
      
      this.renderer.appendChild(document.head, link);
    });
  }
}
```

### Window Event Service

```typescript
import { Injectable, NgZone } from '@angular/core';
import { PlatformService } from '@cci-web/core';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WindowEventService {
  constructor(
    private platformService: PlatformService,
    private ngZone: NgZone
  ) {}

  // Window resize events
  onResize(): Observable<Event> {
    const window = this.platformService.getWindow();
    if (window) {
      return this.ngZone.runOutsideAngular(() => 
        fromEvent(window, 'resize').pipe(
          debounceTime(100)
        )
      );
    }
    return EMPTY;
  }

  // Window scroll events
  onScroll(): Observable<Event> {
    const window = this.platformService.getWindow();
    if (window) {
      return this.ngZone.runOutsideAngular(() => 
        fromEvent(window, 'scroll').pipe(
          debounceTime(50)
        )
      );
    }
    return EMPTY;
  }

  // Window focus/blur events
  onFocus(): Observable<Event> {
    const window = this.platformService.getWindow();
    return window ? fromEvent(window, 'focus') : EMPTY;
  }

  onBlur(): Observable<Event> {
    const window = this.platformService.getWindow();
    return window ? fromEvent(window, 'blur') : EMPTY;
  }

  // Online/offline events
  onOnline(): Observable<Event> {
    const window = this.platformService.getWindow();
    return window ? fromEvent(window, 'online') : EMPTY;
  }

  onOffline(): Observable<Event> {
    const window = this.platformService.getWindow();
    return window ? fromEvent(window, 'offline') : EMPTY;
  }

  // Get current online status
  isOnline(): boolean {
    const window = this.platformService.getWindow();
    return window ? window.navigator.onLine : true; // Assume online in SSR
  }
}
```

### Responsive Utility Service

```typescript
import { Injectable } from '@angular/core';
import { PlatformService } from '@cci-web/core';
import { WindowEventService } from './window-event.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface ViewportSize {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class ViewportService {
  private viewportSize$ = new BehaviorSubject<ViewportSize>({ width: 0, height: 0 });

  constructor(
    private platformService: PlatformService,
    private windowEventService: WindowEventService
  ) {
    this.initializeViewportTracking();
  }

  private initializeViewportTracking(): void {
    if (this.platformService.isBrowser) {
      // Initial size
      this.updateViewportSize();
      
      // Listen to resize events
      this.windowEventService.onResize().subscribe(() => {
        this.updateViewportSize();
      });
    }
  }

  private updateViewportSize(): void {
    const window = this.platformService.getWindow();
    if (window) {
      this.viewportSize$.next({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  }

  // Get current viewport size
  getViewportSize(): ViewportSize {
    return this.viewportSize$.value;
  }

  // Observable viewport size
  getViewportSize$(): Observable<ViewportSize> {
    return this.viewportSize$.asObservable();
  }

  // Check if mobile
  isMobile$(): Observable<boolean> {
    return this.viewportSize$.pipe(
      map(size => size.width < 768)
    );
  }

  // Check if tablet
  isTablet$(): Observable<boolean> {
    return this.viewportSize$.pipe(
      map(size => size.width >= 768 && size.width < 1024)
    );
  }

  // Check if desktop
  isDesktop$(): Observable<boolean> {
    return this.viewportSize$.pipe(
      map(size => size.width >= 1024)
    );
  }

  // Get current device type
  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const size = this.getViewportSize();
    if (size.width < 768) return 'mobile';
    if (size.width < 1024) return 'tablet';
    return 'desktop';
  }
}
```

## Thực hành tốt nhất

### 1. Always Check Platform Before DOM Operations

```typescript
// ✅ Good: Platform-aware DOM access
class SafeDomService {
  constructor(private platformService: PlatformService) {}

  manipulateDOM(): void {
    if (this.platformService.isBrowser) {
      const element = this.platformService.document?.getElementById('myElement');
      if (element) {
        element.style.display = 'none';
      }
    }
  }
}

// ❌ Bad: Direct DOM access
class UnsafeDomService {
  manipulateDOM(): void {
    // This will fail in SSR
    const element = document.getElementById('myElement');
    element.style.display = 'none';
  }
}
```

### 2. Safe Storage Operations

```typescript
// ✅ Good: Safe storage with fallbacks
class SafeStorageService {
  constructor(private platformService: PlatformService) {}

  saveUserPreference(key: string, value: any): void {
    const localStorage = this.platformService.getLocalStorage();
    if (localStorage) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        // Fallback to in-memory storage or server-side storage
        console.warn('LocalStorage not available, using fallback');
        this.saveToFallbackStorage(key, value);
      }
    } else {
      // SSR or storage disabled
      this.saveToFallbackStorage(key, value);
    }
  }

  private saveToFallbackStorage(key: string, value: any): void {
    // Implement fallback storage logic
  }
}
```

### 3. Event Handling with Platform Check

```typescript
// ✅ Good: Platform-aware event handling
class SafeEventService {
  constructor(private platformService: PlatformService) {}

  setupEventListeners(): void {
    if (this.platformService.isBrowser) {
      const window = this.platformService.getWindow();
      if (window) {
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('scroll', this.onScroll.bind(this));
      }
    }
  }

  private onResize(event: Event): void {
    // Handle resize
  }

  private onScroll(event: Event): void {
    // Handle scroll
  }
}
```

### 4. Conditional Rendering Based on Platform

```typescript
// ✅ Good: Platform-aware component
@Component({
  selector: 'app-platform-specific',
  template: `
    <div class="content">
      <!-- Always rendered content -->
      <h1>{{ title }}</h1>
      
      <!-- Browser-only content -->
      <div *ngIf="isBrowser">
        <button (click)="openModal()">Open Modal</button>
        <canvas #canvas></canvas>
      </div>
      
      <!-- Server-side placeholder -->
      <div *ngIf="!isBrowser" class="ssr-placeholder">
        <p>Interactive content will load in browser</p>
      </div>
    </div>
  `
})
export class PlatformSpecificComponent {
  title = 'My App';

  constructor(private platformService: PlatformService) {}

  get isBrowser(): boolean {
    return this.platformService.isBrowser;
  }

  openModal(): void {
    // This method will only be called in browser
    if (this.platformService.isBrowser) {
      // Modal logic
    }
  }
}
```

## Cân nhắc về hiệu suất

### 1. Cached Platform Detection
- Platform detection được cache sau lần đầu tiên
- Không cần gọi lại `isPlatformBrowser` nhiều lần
- Sử dụng getters để access cached values

### 2. Lazy Initialization
- Objects chỉ được initialize khi cần thiết
- Storage objects được test trước khi sử dụng
- Error handling cho disabled storage

### 3. Memory Management
- Service được provide ở root level (singleton)
- Không tạo multiple instances
- Proper cleanup cho event listeners

## Khắc phục sự cố

### Common Issues

**1. Storage Not Available**
```typescript
// Check storage availability
if (!this.platformService.isStorageAvailable()) {
  console.warn('Storage not available - using fallback');
  // Implement fallback logic
}
```

**2. SSR Hydration Issues**
```typescript
// Ensure consistent rendering
@Component({
  template: `
    <div [class.browser-only]="isBrowser">
      <!-- Content that might differ between SSR and browser -->
    </div>
  `
})
export class ConsistentComponent {
  isBrowser = false;

  ngAfterViewInit() {
    // Set browser flag after view init to avoid hydration mismatch
    this.isBrowser = this.platformService.isBrowser;
  }
}
```

**3. Window/Document Access Errors**
```typescript
// Always check availability
const window = this.platformService.getWindow();
if (window) {
  // Safe to use window
  const location = window.location;
} else {
  // Handle SSR case
  console.log('Window not available in SSR');
}
```

## Phụ thuộc

- `@angular/core`: Angular framework
- `@angular/common`: Platform detection utilities

## Related Services

- **WindowService**: Extended window access
- **DocumentService**: Extended document access
- **StorageService**: Enhanced storage operations
- **DomService**: Safe DOM manipulation
- **ViewportService**: Responsive utilities