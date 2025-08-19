# Window Service - Safe Window Access Service

## Giới thiệu

Window Service là service cốt lõi cung cấp quyền truy cập an toàn đến đối tượng `window` gốc và cấu hình ứng dụng từ `__CONFIG_APP__`. Service này đảm bảo hoạt động tốt trong cả môi trường browser và server-side rendering (SSR).

## Tính năng chính

- **Safe Window Access**: Truy cập an toàn đến window object
- **SSR Compatible**: Hoạt động tốt trong server-side rendering
- **Configuration Access**: Truy cập cấu hình từ window.__CONFIG_APP__
- **Type Safety**: Full TypeScript support
- **Null Safety**: Tránh errors khi window không tồn tại
- **Platform Detection**: Tự động phát hiện môi trường
- **Singleton Pattern**: Single instance across application

## Dependencies

Service này phụ thuộc vào các Angular core modules:

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
```

## API Reference

### Properties

| Property | Type | Mô tả |
|----------|------|-------|
| `nativeWindow` | `Window \| null` | Native window object (null trong SSR) |
| `isBrowser` | `boolean` | True nếu đang chạy trong browser |
| `configApp` | `any \| null` | Application configuration từ window.__CONFIG_APP__ |

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `getWindow()` | `getWindow(): Window \| null` | Lấy window object an toàn |
| `getConfigApp()` | `getConfigApp(): any \| null` | Lấy cấu hình ứng dụng |
| `isWindowAvailable()` | `isWindowAvailable(): boolean` | Kiểm tra window có sẵn |
| `getLocation()` | `getLocation(): Location \| null` | Lấy window.location an toàn |
| `getNavigator()` | `getNavigator(): Navigator \| null` | Lấy window.navigator an toàn |
| `getDocument()` | `getDocument(): Document \| null` | Lấy window.document an toàn |
| `getLocalStorage()` | `getLocalStorage(): Storage \| null` | Lấy localStorage an toàn |
| `getSessionStorage()` | `getSessionStorage(): Storage \| null` | Lấy sessionStorage an toàn |

## Implementation Details

### Service Structure

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  private _nativeWindow: Window | null = null;
  private _isBrowser: boolean;
  private _configApp: any | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this._isBrowser = isPlatformBrowser(this.platformId);
    this.initializeWindow();
  }

  private initializeWindow(): void {
    if (this._isBrowser) {
      this._nativeWindow = window;
      this.loadConfigApp();
    }
  }

  private loadConfigApp(): void {
    if (this._nativeWindow && (this._nativeWindow as any).__CONFIG_APP__) {
      try {
        this._configApp = (this._nativeWindow as any).__CONFIG_APP__;
      } catch (error) {
        console.warn('Failed to load __CONFIG_APP__:', error);
        this._configApp = null;
      }
    }
  }

  // Getters
  get nativeWindow(): Window | null {
    return this._nativeWindow;
  }

  get isBrowser(): boolean {
    return this._isBrowser;
  }

  get configApp(): any | null {
    return this._configApp;
  }

  // Public methods
  getWindow(): Window | null {
    return this._nativeWindow;
  }

  getConfigApp(): any | null {
    return this._configApp;
  }

  isWindowAvailable(): boolean {
    return this._nativeWindow !== null;
  }

  getLocation(): Location | null {
    return this._nativeWindow ? this._nativeWindow.location : null;
  }

  getNavigator(): Navigator | null {
    return this._nativeWindow ? this._nativeWindow.navigator : null;
  }

  getDocument(): Document | null {
    return this._nativeWindow ? this._nativeWindow.document : null;
  }

  getLocalStorage(): Storage | null {
    if (this._nativeWindow) {
      try {
        return this._nativeWindow.localStorage;
      } catch (error) {
        console.warn('localStorage not available:', error);
        return null;
      }
    }
    return null;
  }

  getSessionStorage(): Storage | null {
    if (this._nativeWindow) {
      try {
        return this._nativeWindow.sessionStorage;
      } catch (error) {
        console.warn('sessionStorage not available:', error);
        return null;
      }
    }
    return null;
  }

  // Utility methods
  getCurrentUrl(): string | null {
    const location = this.getLocation();
    return location ? location.href : null;
  }

  getCurrentHost(): string | null {
    const location = this.getLocation();
    return location ? location.host : null;
  }

  getCurrentPathname(): string | null {
    const location = this.getLocation();
    return location ? location.pathname : null;
  }

  getUserAgent(): string | null {
    const navigator = this.getNavigator();
    return navigator ? navigator.userAgent : null;
  }

  getScreenSize(): { width: number; height: number } | null {
    if (this._nativeWindow && this._nativeWindow.screen) {
      return {
        width: this._nativeWindow.screen.width,
        height: this._nativeWindow.screen.height
      };
    }
    return null;
  }

  getViewportSize(): { width: number; height: number } | null {
    if (this._nativeWindow) {
      return {
        width: this._nativeWindow.innerWidth,
        height: this._nativeWindow.innerHeight
      };
    }
    return null;
  }

  // Configuration helpers
  getConfigValue(key: string, defaultValue?: any): any {
    if (this._configApp && this._configApp[key] !== undefined) {
      return this._configApp[key];
    }
    return defaultValue;
  }

  hasConfigValue(key: string): boolean {
    return this._configApp && this._configApp[key] !== undefined;
  }

  // Window manipulation
  scrollTo(x: number, y: number): void {
    if (this._nativeWindow) {
      this._nativeWindow.scrollTo(x, y);
    }
  }

  scrollToTop(): void {
    this.scrollTo(0, 0);
  }

  reload(): void {
    if (this._nativeWindow) {
      this._nativeWindow.location.reload();
    }
  }

  redirect(url: string): void {
    if (this._nativeWindow) {
      this._nativeWindow.location.href = url;
    }
  }

  openNewWindow(url: string, name?: string, features?: string): Window | null {
    if (this._nativeWindow) {
      return this._nativeWindow.open(url, name, features);
    }
    return null;
  }

  // Event handling
  addEventListener(event: string, handler: EventListener): void {
    if (this._nativeWindow) {
      this._nativeWindow.addEventListener(event, handler);
    }
  }

  removeEventListener(event: string, handler: EventListener): void {
    if (this._nativeWindow) {
      this._nativeWindow.removeEventListener(event, handler);
    }
  }

  // Focus management
  focus(): void {
    if (this._nativeWindow) {
      this._nativeWindow.focus();
    }
  }

  blur(): void {
    if (this._nativeWindow) {
      this._nativeWindow.blur();
    }
  }

  // Print functionality
  print(): void {
    if (this._nativeWindow) {
      this._nativeWindow.print();
    }
  }
}
```

## Cách sử dụng

### Basic Window Access

```typescript
import { Component, OnInit } from '@angular/core';
import { WindowService } from '@cci-web/core';

@Component({
  selector: 'app-window-demo',
  template: `
    <div class="window-info">
      <h2>Window Information</h2>
      
      <div *ngIf="isBrowser; else serverMessage">
        <div class="info-section">
          <h3>Location Info</h3>
          <p>Current URL: {{ currentUrl }}</p>
          <p>Host: {{ currentHost }}</p>
          <p>Pathname: {{ currentPathname }}</p>
        </div>
        
        <div class="info-section">
          <h3>Browser Info</h3>
          <p>User Agent: {{ userAgent }}</p>
          <p>Screen Size: {{ screenSize?.width }} x {{ screenSize?.height }}</p>
          <p>Viewport Size: {{ viewportSize?.width }} x {{ viewportSize?.height }}</p>
        </div>
        
        <div class="info-section" *ngIf="hasConfig">
          <h3>Application Configuration</h3>
          <pre>{{ configApp | json }}</pre>
        </div>
        
        <div class="actions">
          <button (click)="scrollToTop()">Scroll to Top</button>
          <button (click)="printPage()">Print Page</button>
          <button (click)="openNewWindow()">Open New Window</button>
        </div>
      </div>
      
      <ng-template #serverMessage>
        <p>This content is being rendered on the server.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .window-info { padding: 20px; }
    .info-section { margin-bottom: 20px; }
    .actions button { margin-right: 10px; margin-bottom: 10px; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; }
  `]
})
export class WindowDemoComponent implements OnInit {
  currentUrl: string | null = null;
  currentHost: string | null = null;
  currentPathname: string | null = null;
  userAgent: string | null = null;
  screenSize: { width: number; height: number } | null = null;
  viewportSize: { width: number; height: number } | null = null;
  configApp: any | null = null;
  hasConfig = false;

  constructor(private windowService: WindowService) {}

  ngOnInit() {
    if (this.windowService.isBrowser) {
      this.loadWindowInfo();
    }
  }

  private loadWindowInfo(): void {
    this.currentUrl = this.windowService.getCurrentUrl();
    this.currentHost = this.windowService.getCurrentHost();
    this.currentPathname = this.windowService.getCurrentPathname();
    this.userAgent = this.windowService.getUserAgent();
    this.screenSize = this.windowService.getScreenSize();
    this.viewportSize = this.windowService.getViewportSize();
    this.configApp = this.windowService.getConfigApp();
    this.hasConfig = this.configApp !== null;
  }

  get isBrowser(): boolean {
    return this.windowService.isBrowser;
  }

  scrollToTop(): void {
    this.windowService.scrollToTop();
  }

  printPage(): void {
    this.windowService.print();
  }

  openNewWindow(): void {
    this.windowService.openNewWindow('https://example.com', '_blank');
  }
}
```

### Configuration Access Service

```typescript
import { Injectable } from '@angular/core';
import { WindowService } from '@cci-web/core';

interface AppConfiguration {
  apiUrl: string;
  appName: string;
  version: string;
  environment: string;
  features: { [key: string]: boolean };
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private _config: AppConfiguration | null = null;

  constructor(private windowService: WindowService) {
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    const configApp = this.windowService.getConfigApp();
    if (configApp) {
      this._config = this.parseConfiguration(configApp);
    } else {
      this._config = this.getDefaultConfiguration();
    }
  }

  private parseConfiguration(configApp: any): AppConfiguration {
    return {
      apiUrl: configApp.apiUrl || 'http://localhost:3000/api',
      appName: configApp.appName || 'CCI Web App',
      version: configApp.version || '1.0.0',
      environment: configApp.environment || 'development',
      features: configApp.features || {},
      theme: {
        primaryColor: configApp.theme?.primaryColor || '#007bff',
        secondaryColor: configApp.theme?.secondaryColor || '#6c757d'
      }
    };
  }

  private getDefaultConfiguration(): AppConfiguration {
    return {
      apiUrl: 'http://localhost:3000/api',
      appName: 'CCI Web App',
      version: '1.0.0',
      environment: 'development',
      features: {},
      theme: {
        primaryColor: '#007bff',
        secondaryColor: '#6c757d'
      }
    };
  }

  // Configuration getters
  getApiUrl(): string {
    return this._config?.apiUrl || 'http://localhost:3000/api';
  }

  getAppName(): string {
    return this._config?.appName || 'CCI Web App';
  }

  getVersion(): string {
    return this._config?.version || '1.0.0';
  }

  getEnvironment(): string {
    return this._config?.environment || 'development';
  }

  isFeatureEnabled(feature: string): boolean {
    return this._config?.features[feature] === true;
  }

  getThemeColor(type: 'primary' | 'secondary'): string {
    return this._config?.theme[type === 'primary' ? 'primaryColor' : 'secondaryColor'] || '#007bff';
  }

  getFullConfiguration(): AppConfiguration | null {
    return this._config;
  }

  // Configuration updates
  updateConfiguration(updates: Partial<AppConfiguration>): void {
    if (this._config) {
      this._config = { ...this._config, ...updates };
      
      // Update window.__CONFIG_APP__ if available
      const window = this.windowService.getWindow();
      if (window && (window as any).__CONFIG_APP__) {
        (window as any).__CONFIG_APP__ = { ...(window as any).__CONFIG_APP__, ...updates };
      }
    }
  }
}
```

### URL Navigation Service

```typescript
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowService } from '@cci-web/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(
    private windowService: WindowService,
    private router: Router
  ) {}

  // Get current URL information
  getCurrentUrl(): string | null {
    return this.windowService.getCurrentUrl();
  }

  getCurrentPath(): string | null {
    return this.windowService.getCurrentPathname();
  }

  getCurrentHost(): string | null {
    return this.windowService.getCurrentHost();
  }

  // Navigation methods
  navigateToExternal(url: string, newWindow: boolean = false): void {
    if (newWindow) {
      this.windowService.openNewWindow(url, '_blank');
    } else {
      this.windowService.redirect(url);
    }
  }

  navigateToInternal(route: string[]): void {
    this.router.navigate(route);
  }

  goBack(): void {
    const window = this.windowService.getWindow();
    if (window && window.history) {
      window.history.back();
    }
  }

  goForward(): void {
    const window = this.windowService.getWindow();
    if (window && window.history) {
      window.history.forward();
    }
  }

  reload(): void {
    this.windowService.reload();
  }

  // URL utilities
  getQueryParam(param: string): string | null {
    const location = this.windowService.getLocation();
    if (location) {
      const urlParams = new URLSearchParams(location.search);
      return urlParams.get(param);
    }
    return null;
  }

  getAllQueryParams(): { [key: string]: string } {
    const params: { [key: string]: string } = {};
    const location = this.windowService.getLocation();
    
    if (location) {
      const urlParams = new URLSearchParams(location.search);
      urlParams.forEach((value, key) => {
        params[key] = value;
      });
    }
    
    return params;
  }

  getHashFragment(): string | null {
    const location = this.windowService.getLocation();
    return location ? location.hash.substring(1) : null;
  }

  // Social sharing
  shareOnFacebook(url?: string): void {
    const shareUrl = url || this.getCurrentUrl();
    if (shareUrl) {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      this.windowService.openNewWindow(facebookUrl, 'facebook-share', 'width=600,height=400');
    }
  }

  shareOnTwitter(url?: string, text?: string): void {
    const shareUrl = url || this.getCurrentUrl();
    if (shareUrl) {
      let twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;
      if (text) {
        twitterUrl += `&text=${encodeURIComponent(text)}`;
      }
      this.windowService.openNewWindow(twitterUrl, 'twitter-share', 'width=600,height=400');
    }
  }

  shareOnLinkedIn(url?: string): void {
    const shareUrl = url || this.getCurrentUrl();
    if (shareUrl) {
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      this.windowService.openNewWindow(linkedInUrl, 'linkedin-share', 'width=600,height=400');
    }
  }
}
```

### Storage Service với Window Service

```typescript
import { Injectable } from '@angular/core';
import { WindowService } from '@cci-web/core';

@Injectable({
  providedIn: 'root'
})
export class SafeStorageService {
  constructor(private windowService: WindowService) {}

  // LocalStorage operations
  setLocalItem(key: string, value: any): boolean {
    const localStorage = this.windowService.getLocalStorage();
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

  getLocalItem<T>(key: string, defaultValue?: T): T | null {
    const localStorage = this.windowService.getLocalStorage();
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

  removeLocalItem(key: string): boolean {
    const localStorage = this.windowService.getLocalStorage();
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

  clearLocalStorage(): boolean {
    const localStorage = this.windowService.getLocalStorage();
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
    const sessionStorage = this.windowService.getSessionStorage();
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
    const sessionStorage = this.windowService.getSessionStorage();
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
    const sessionStorage = this.windowService.getSessionStorage();
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

  clearSessionStorage(): boolean {
    const sessionStorage = this.windowService.getSessionStorage();
    if (sessionStorage) {
      try {
        sessionStorage.clear();
        return true;
      } catch (error) {
        console.error('Failed to clear sessionStorage:', error);
        return false;
      }
    }
    return false;
  }

  // Storage availability checks
  isLocalStorageAvailable(): boolean {
    return this.windowService.getLocalStorage() !== null;
  }

  isSessionStorageAvailable(): boolean {
    return this.windowService.getSessionStorage() !== null;
  }

  // Storage size utilities
  getLocalStorageSize(): number {
    const localStorage = this.windowService.getLocalStorage();
    if (localStorage) {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    }
    return 0;
  }

  getSessionStorageSize(): number {
    const sessionStorage = this.windowService.getSessionStorage();
    if (sessionStorage) {
      let total = 0;
      for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          total += sessionStorage[key].length + key.length;
        }
      }
      return total;
    }
    return 0;
  }
}
```

### Event Handling Service

```typescript
import { Injectable, NgZone } from '@angular/core';
import { WindowService } from '@cci-web/core';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WindowEventService {
  constructor(
    private windowService: WindowService,
    private ngZone: NgZone
  ) {}

  // Resize events
  onResize(): Observable<Event> {
    const window = this.windowService.getWindow();
    if (window) {
      return this.ngZone.runOutsideAngular(() => 
        fromEvent(window, 'resize').pipe(
          debounceTime(100)
        )
      );
    }
    return EMPTY;
  }

  // Scroll events
  onScroll(): Observable<Event> {
    const window = this.windowService.getWindow();
    if (window) {
      return this.ngZone.runOutsideAngular(() => 
        fromEvent(window, 'scroll').pipe(
          throttleTime(16) // ~60fps
        )
      );
    }
    return EMPTY;
  }

  // Focus/blur events
  onFocus(): Observable<Event> {
    const window = this.windowService.getWindow();
    return window ? fromEvent(window, 'focus') : EMPTY;
  }

  onBlur(): Observable<Event> {
    const window = this.windowService.getWindow();
    return window ? fromEvent(window, 'blur') : EMPTY;
  }

  // Online/offline events
  onOnline(): Observable<Event> {
    const window = this.windowService.getWindow();
    return window ? fromEvent(window, 'online') : EMPTY;
  }

  onOffline(): Observable<Event> {
    const window = this.windowService.getWindow();
    return window ? fromEvent(window, 'offline') : EMPTY;
  }

  // Beforeunload event
  onBeforeUnload(): Observable<BeforeUnloadEvent> {
    const window = this.windowService.getWindow();
    return window ? fromEvent<BeforeUnloadEvent>(window, 'beforeunload') : EMPTY;
  }

  // Popstate event (browser back/forward)
  onPopState(): Observable<PopStateEvent> {
    const window = this.windowService.getWindow();
    return window ? fromEvent<PopStateEvent>(window, 'popstate') : EMPTY;
  }

  // Keyboard events
  onKeyDown(): Observable<KeyboardEvent> {
    const window = this.windowService.getWindow();
    return window ? fromEvent<KeyboardEvent>(window, 'keydown') : EMPTY;
  }

  onKeyUp(): Observable<KeyboardEvent> {
    const window = this.windowService.getWindow();
    return window ? fromEvent<KeyboardEvent>(window, 'keyup') : EMPTY;
  }

  // Mouse events
  onMouseMove(): Observable<MouseEvent> {
    const window = this.windowService.getWindow();
    if (window) {
      return this.ngZone.runOutsideAngular(() => 
        fromEvent<MouseEvent>(window, 'mousemove').pipe(
          throttleTime(16) // ~60fps
        )
      );
    }
    return EMPTY;
  }

  // Utility methods
  getCurrentScrollPosition(): { x: number; y: number } {
    const window = this.windowService.getWindow();
    if (window) {
      return {
        x: window.pageXOffset || 0,
        y: window.pageYOffset || 0
      };
    }
    return { x: 0, y: 0 };
  }

  isOnline(): boolean {
    const navigator = this.windowService.getNavigator();
    return navigator ? navigator.onLine : true;
  }

  getViewportSize(): { width: number; height: number } {
    const size = this.windowService.getViewportSize();
    return size || { width: 0, height: 0 };
  }
}
```

## Best Practices

### 1. Always Check Window Availability

```typescript
// ✅ Good: Check window availability
class SafeWindowService {
  constructor(private windowService: WindowService) {}

  doSomethingWithWindow(): void {
    const window = this.windowService.getWindow();
    if (window) {
      // Safe to use window
      window.alert('Hello World!');
    } else {
      // Handle SSR case
      console.log('Window not available in SSR');
    }
  }
}

// ❌ Bad: Direct window access
class UnsafeWindowService {
  doSomethingWithWindow(): void {
    // This will fail in SSR
    window.alert('Hello World!');
  }
}
```

### 2. Configuration Access with Fallbacks

```typescript
// ✅ Good: Configuration with fallbacks
class ConfigService {
  constructor(private windowService: WindowService) {}

  getApiUrl(): string {
    const configValue = this.windowService.getConfigValue('apiUrl');
    return configValue || 'http://localhost:3000/api';
  }

  isFeatureEnabled(feature: string): boolean {
    const features = this.windowService.getConfigValue('features', {});
    return features[feature] === true;
  }
}
```

### 3. Event Handling with Cleanup

```typescript
// ✅ Good: Proper event cleanup
@Component({
  selector: 'app-window-events'
})
export class WindowEventsComponent implements OnInit, OnDestroy {
  private resizeHandler = this.onResize.bind(this);

  constructor(private windowService: WindowService) {}

  ngOnInit() {
    this.windowService.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy() {
    this.windowService.removeEventListener('resize', this.resizeHandler);
  }

  private onResize(event: Event): void {
    // Handle resize
  }
}
```

### 4. Storage Operations with Error Handling

```typescript
// ✅ Good: Safe storage operations
class StorageService {
  constructor(private windowService: WindowService) {}

  saveData(key: string, data: any): boolean {
    const localStorage = this.windowService.getLocalStorage();
    if (localStorage) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Storage quota exceeded or disabled:', error);
        return false;
      }
    }
    return false;
  }
}
```

## Performance Considerations

### 1. Singleton Pattern
- Service được provide ở root level
- Single instance across entire application
- Window object được cache sau initialization

### 2. Lazy Configuration Loading
- Configuration chỉ được load khi cần thiết
- Error handling cho missing configuration
- Fallback values cho missing config keys

### 3. Event Optimization
- Sử dụng NgZone.runOutsideAngular cho high-frequency events
- Debounce/throttle cho resize và scroll events
- Proper cleanup để tránh memory leaks

## Troubleshooting

### Common Issues

**1. Window Not Available in SSR**
```typescript
// Check if running in browser
if (this.windowService.isBrowser) {
  // Browser-specific code
} else {
  // SSR fallback
}
```

**2. Configuration Not Found**
```typescript
// Check configuration availability
if (this.windowService.hasConfigValue('apiUrl')) {
  const apiUrl = this.windowService.getConfigValue('apiUrl');
} else {
  // Use default configuration
}
```

**3. Storage Not Available**
```typescript
// Check storage availability
const localStorage = this.windowService.getLocalStorage();
if (localStorage) {
  // Use localStorage
} else {
  // Use alternative storage or skip
}
```

## Dependencies

- `@angular/core`: Angular framework
- `@angular/common`: Platform detection utilities

## Related Services

- **PlatformService**: Extended platform detection
- **DocumentService**: Document access
- **ConfigMergeService**: Configuration management
- **StorageService**: Enhanced storage operations