# Remote CSS Service

## Giới thiệu

Remote CSS Service là một service chuyên biệt trong CCI Web Framework, được thiết kế để quản lý việc tải và áp dụng CSS từ các nguồn từ xa (remote sources). Service này cung cấp khả năng tải động CSS stylesheets, quản lý dependencies, caching thông minh, và xử lý lỗi robust cho việc styling động trong ứng dụng web.

## Tính năng chính

### 1. Dynamic CSS Loading
- Tải CSS từ remote URLs
- Hỗ trợ multiple CSS sources
- Lazy loading CSS khi cần thiết
- Conditional CSS loading

### 2. Dependency Management
- Quản lý CSS dependencies
- Load order optimization
- Cascade management
- Style priority handling

### 3. Caching & Performance
- Intelligent CSS caching
- Cache invalidation strategies
- Compression support
- Minification handling

### 4. Error Handling
- Robust error recovery
- Fallback CSS support
- Retry mechanisms
- Loading state management

### 5. Theme Management
- Dynamic theme switching
- CSS variable management
- Media query handling
- Responsive CSS loading

### 6. Security
- CSP compliance
- CORS handling
- URL validation
- Safe CSS injection

## Phụ thuộc

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { PlatformService } from './platform.service';
import { CacheService } from './cache.service';
import { LoaderService } from './loader.service';
```

## Tham chiếu API

### Thuộc tính

```typescript
interface RemoteCSSService {
  // Core properties
  readonly isLoading$: Observable<boolean>;
  readonly loadedStyles$: Observable<string[]>;
  readonly currentTheme$: Observable<string>;
  readonly cssVariables$: Observable<Record<string, string>>;
  
  // Configuration
  readonly config: RemoteCSSConfig;
  readonly cache: Map<string, CSSStyleSheet>;
  readonly loadingQueue: Set<string>;
  readonly failedUrls: Set<string>;
}
```

### Phương thức

#### Core CSS Loading

```typescript
// Load single CSS file
loadCSS(url: string, options?: CSSLoadOptions): Promise<CSSStyleSheet>;

// Load multiple CSS files
loadMultipleCSS(urls: string[], options?: CSSLoadOptions): Promise<CSSStyleSheet[]>;

// Load CSS with dependencies
loadCSSWithDependencies(url: string, dependencies: string[], options?: CSSLoadOptions): Promise<CSSStyleSheet>;

// Preload CSS for future use
preloadCSS(urls: string[], options?: PreloadOptions): Promise<void>;
```

#### Theme Management

```typescript
// Load theme CSS
loadTheme(themeName: string, themeUrl: string): Promise<void>;

// Switch between themes
switchTheme(themeName: string): Promise<void>;

// Get available themes
getAvailableThemes(): string[];

// Remove theme
removeTheme(themeName: string): Promise<void>;
```

#### CSS Variables

```typescript
// Set CSS variables
setCSSVariables(variables: Record<string, string>): void;

// Get CSS variable value
getCSSVariable(name: string): string | null;

// Update CSS variable
updateCSSVariable(name: string, value: string): void;

// Remove CSS variable
removeCSSVariable(name: string): void;
```

#### Cache Management

```typescript
// Clear CSS cache
clearCache(): void;

// Remove cached CSS
removeCachedCSS(url: string): void;

// Get cache statistics
getCacheStats(): CSSCacheStats;

// Optimize cache
optimizeCache(): void;
```

#### Utilities

```typescript
// Check if CSS is loaded
isLoaded(url: string): boolean;

// Get loading progress
getLoadingProgress(): CSSLoadingProgress;

// Retry failed CSS loads
retryFailedLoads(): Promise<void>;

// Validate CSS URL
validateURL(url: string): boolean;
```

## Chi tiết triển khai

### Interfaces

```typescript
interface CSSLoadOptions {
  priority?: 'high' | 'medium' | 'low';
  cache?: boolean;
  timeout?: number;
  retries?: number;
  media?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  onLoad?: (stylesheet: CSSStyleSheet) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  cache?: boolean;
  prefetch?: boolean;
}

interface CSSLoadingProgress {
  total: number;
  loaded: number;
  failed: number;
  percentage: number;
  currentUrl?: string;
  estimatedTimeRemaining?: number;
}

interface CSSCacheStats {
  totalSize: number;
  itemCount: number;
  hitRate: number;
  missRate: number;
  lastCleanup: Date;
}

interface RemoteCSSConfig {
  baseUrl?: string;
  timeout: number;
  retries: number;
  cache: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
  };
  security: {
    allowedDomains: string[];
    cspEnabled: boolean;
    validateIntegrity: boolean;
  };
  performance: {
    preloadCritical: boolean;
    lazyLoadNonCritical: boolean;
    compressionEnabled: boolean;
  };
}
```

### Cấu trúc Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class RemoteCSSService {
  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  private readonly _loadedStyles$ = new BehaviorSubject<string[]>([]);
  private readonly _currentTheme$ = new BehaviorSubject<string>('default');
  private readonly _cssVariables$ = new BehaviorSubject<Record<string, string>>({});
  
  private readonly cache = new Map<string, CSSStyleSheet>();
  private readonly loadingQueue = new Set<string>();
  private readonly failedUrls = new Set<string>();
  private readonly themes = new Map<string, string>();
  private readonly cssVariables = new Map<string, string>();
  
  constructor(
    private http: HttpClient,
    private platformService: PlatformService,
    private cacheService: CacheService,
    private loaderService: LoaderService
  ) {
    this.initializeService();
  }
  
  // Implementation methods...
}
```

## Ví dụ sử dụng

### Tải CSS cơ bản

```typescript
import { Component, OnInit } from '@angular/core';
import { RemoteCSSService } from '@cci-web/core/services';

@Component({
  selector: 'app-basic-css',
  template: `
    <div class="container">
      <h1>Dynamic CSS Loading</h1>
      <button (click)="loadBootstrap()">Load Bootstrap</button>
      <button (click)="loadCustomTheme()">Load Custom Theme</button>
      <div *ngIf="isLoading" class="loading">Loading CSS...</div>
    </div>
  `
})
export class BasicCSSComponent implements OnInit {
  isLoading = false;
  
  constructor(private remoteCSSService: RemoteCSSService) {}
  
  ngOnInit(): void {
    // Monitor loading state
    this.remoteCSSService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
    
    // Load critical CSS immediately
    this.loadCriticalCSS();
  }
  
  async loadCriticalCSS(): Promise<void> {
    try {
      await this.remoteCSSService.loadCSS('https://cdn.example.com/css/critical.css', {
        priority: 'high',
        cache: true,
        timeout: 5000
      });
      
      console.log('Critical CSS loaded successfully');
    } catch (error) {
      console.error('Failed to load critical CSS:', error);
    }
  }
  
  async loadBootstrap(): Promise<void> {
    try {
      await this.remoteCSSService.loadCSS('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css', {
        priority: 'medium',
        cache: true,
        integrity: 'sha384-...',
        onLoad: (stylesheet) => {
          console.log('Bootstrap CSS loaded:', stylesheet.cssRules.length, 'rules');
        }
      });
      
      console.log('Bootstrap loaded successfully');
    } catch (error) {
      console.error('Failed to load Bootstrap:', error);
    }
  }
  
  async loadCustomTheme(): Promise<void> {
    try {
      await this.remoteCSSService.loadTheme('dark', 'https://cdn.example.com/themes/dark.css');
      await this.remoteCSSService.switchTheme('dark');
      
      console.log('Dark theme applied');
    } catch (error) {
      console.error('Failed to load custom theme:', error);
    }
  }
}
```

### Advanced Theme Management

```typescript
import { Injectable } from '@angular/core';
import { RemoteCSSService } from '@cci-web/core/services';

@Injectable({
  providedIn: 'root'
})
export class ThemeManagerService {
  private readonly themes = {
    light: 'https://cdn.example.com/themes/light.css',
    dark: 'https://cdn.example.com/themes/dark.css',
    blue: 'https://cdn.example.com/themes/blue.css',
    green: 'https://cdn.example.com/themes/green.css'
  };
  
  constructor(private remoteCSSService: RemoteCSSService) {
    this.initializeThemes();
  }
  
  private async initializeThemes(): Promise<void> {
    try {
      // Preload all themes
      const themeUrls = Object.values(this.themes);
      await this.remoteCSSService.preloadCSS(themeUrls, {
        priority: 'low',
        cache: true
      });
      
      // Load themes into theme manager
      for (const [name, url] of Object.entries(this.themes)) {
        await this.remoteCSSService.loadTheme(name, url);
      }
      
      console.log('All themes initialized');
    } catch (error) {
      console.error('Failed to initialize themes:', error);
    }
  }
  
  async switchToTheme(themeName: string): Promise<void> {
    if (!this.themes[themeName]) {
      throw new Error(`Theme '${themeName}' not found`);
    }
    
    try {
      await this.remoteCSSService.switchTheme(themeName);
      
      // Update CSS variables for the new theme
      this.updateThemeVariables(themeName);
      
      // Save user preference
      localStorage.setItem('selectedTheme', themeName);
      
      console.log(`Switched to ${themeName} theme`);
    } catch (error) {
      console.error(`Failed to switch to ${themeName} theme:`, error);
    }
  }
  
  private updateThemeVariables(themeName: string): void {
    const themeVariables = this.getThemeVariables(themeName);
    this.remoteCSSService.setCSSVariables(themeVariables);
  }
  
  private getThemeVariables(themeName: string): Record<string, string> {
    const variables: Record<string, Record<string, string>> = {
      light: {
        '--primary-color': '#007bff',
        '--secondary-color': '#6c757d',
        '--background-color': '#ffffff',
        '--text-color': '#212529'
      },
      dark: {
        '--primary-color': '#0d6efd',
        '--secondary-color': '#6c757d',
        '--background-color': '#212529',
        '--text-color': '#ffffff'
      },
      blue: {
        '--primary-color': '#0066cc',
        '--secondary-color': '#004499',
        '--background-color': '#f0f8ff',
        '--text-color': '#003366'
      },
      green: {
        '--primary-color': '#28a745',
        '--secondary-color': '#20c997',
        '--background-color': '#f8fff8',
        '--text-color': '#155724'
      }
    };
    
    return variables[themeName] || variables.light;
  }
  
  getCurrentTheme(): string {
    return localStorage.getItem('selectedTheme') || 'light';
  }
  
  getAvailableThemes(): string[] {
    return Object.keys(this.themes);
  }
  
  async addCustomTheme(name: string, cssUrl: string): Promise<void> {
    try {
      await this.remoteCSSService.loadTheme(name, cssUrl);
      this.themes[name] = cssUrl;
      
      console.log(`Custom theme '${name}' added successfully`);
    } catch (error) {
      console.error(`Failed to add custom theme '${name}':`, error);
    }
  }
  
  async removeTheme(name: string): Promise<void> {
    if (name === 'light' || name === 'dark') {
      throw new Error('Cannot remove default themes');
    }
    
    try {
      await this.remoteCSSService.removeTheme(name);
      delete this.themes[name];
      
      // Switch to default theme if current theme is being removed
      const currentTheme = this.getCurrentTheme();
      if (currentTheme === name) {
        await this.switchToTheme('light');
      }
      
      console.log(`Theme '${name}' removed successfully`);
    } catch (error) {
      console.error(`Failed to remove theme '${name}':`, error);
    }
  }
}
```

### CSS với Dependencies

```typescript
import { Component, OnInit } from '@angular/core';
import { RemoteCSSService } from '@cci-web/core/services';

@Component({
  selector: 'app-dependency-css',
  template: `
    <div class="advanced-layout">
      <h1>CSS with Dependencies</h1>
      <div class="progress-bar" *ngIf="loadingProgress > 0">
        <div class="progress-fill" [style.width.%]="loadingProgress"></div>
        <span class="progress-text">{{loadingProgress}}%</span>
      </div>
      <button (click)="loadCompleteUIFramework()">Load Complete UI Framework</button>
      <button (click)="loadConditionalCSS()">Load Conditional CSS</button>
    </div>
  `,
  styles: [`
    .advanced-layout {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .progress-bar {
      position: relative;
      width: 100%;
      height: 30px;
      background: #f0f0f0;
      border-radius: 15px;
      overflow: hidden;
      margin: 1rem 0;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #0056b3);
      transition: width 0.3s ease;
    }
    
    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #333;
      font-weight: bold;
    }
  `]
})
export class DependencyCSSComponent implements OnInit {
  loadingProgress = 0;
  
  constructor(private remoteCSSService: RemoteCSSService) {}
  
  ngOnInit(): void {
    // Monitor loading progress
    this.remoteCSSService.isLoading$.subscribe(loading => {
      if (!loading) {
        this.loadingProgress = 0;
      }
    });
  }
  
  async loadCompleteUIFramework(): Promise<void> {
    try {
      this.loadingProgress = 0;
      
      // Define CSS dependencies in correct order
      const cssFramework = [
        {
          url: 'https://cdn.example.com/css/normalize.css',
          dependencies: []
        },
        {
          url: 'https://cdn.example.com/css/grid-system.css',
          dependencies: ['https://cdn.example.com/css/normalize.css']
        },
        {
          url: 'https://cdn.example.com/css/components.css',
          dependencies: [
            'https://cdn.example.com/css/normalize.css',
            'https://cdn.example.com/css/grid-system.css'
          ]
        },
        {
          url: 'https://cdn.example.com/css/utilities.css',
          dependencies: [
            'https://cdn.example.com/css/normalize.css',
            'https://cdn.example.com/css/grid-system.css',
            'https://cdn.example.com/css/components.css'
          ]
        }
      ];
      
      // Load CSS with dependencies
      for (let i = 0; i < cssFramework.length; i++) {
        const { url, dependencies } = cssFramework[i];
        
        await this.remoteCSSService.loadCSSWithDependencies(url, dependencies, {
          priority: 'high',
          cache: true,
          onProgress: (progress) => {
            this.loadingProgress = Math.round(((i + progress / 100) / cssFramework.length) * 100);
          }
        });
      }
      
      this.loadingProgress = 100;
      console.log('Complete UI framework loaded successfully');
      
    } catch (error) {
      console.error('Failed to load UI framework:', error);
      this.loadingProgress = 0;
    }
  }
  
  async loadConditionalCSS(): Promise<void> {
    try {
      const userAgent = navigator.userAgent;
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
      const isHighDPI = window.devicePixelRatio > 1;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      const conditionalCSS: string[] = [];
      
      // Load mobile-specific CSS
      if (isMobile) {
        conditionalCSS.push('https://cdn.example.com/css/mobile.css');
        conditionalCSS.push('https://cdn.example.com/css/touch-optimized.css');
      } else {
        conditionalCSS.push('https://cdn.example.com/css/desktop.css');
        conditionalCSS.push('https://cdn.example.com/css/hover-effects.css');
      }
      
      // Load high-DPI CSS
      if (isHighDPI) {
        conditionalCSS.push('https://cdn.example.com/css/retina.css');
      }
      
      // Load reduced motion CSS
      if (prefersReducedMotion) {
        conditionalCSS.push('https://cdn.example.com/css/no-animations.css');
      } else {
        conditionalCSS.push('https://cdn.example.com/css/animations.css');
      }
      
      // Load all conditional CSS
      await this.remoteCSSService.loadMultipleCSS(conditionalCSS, {
        priority: 'medium',
        cache: true
      });
      
      console.log('Conditional CSS loaded:', conditionalCSS);
      
    } catch (error) {
      console.error('Failed to load conditional CSS:', error);
    }
  }
  
  async retryFailedLoads(): Promise<void> {
    try {
      await this.remoteCSSService.retryFailedLoads();
      console.log('Retry completed');
    } catch (error) {
      console.error('Retry failed:', error);
    }
  }
}
```

## Thực hành tốt nhất

### 1. CSS Loading Strategy

```typescript
// ✅ Good: Structured CSS loading
class GoodCSSStrategy {
  async loadCSS(): Promise<void> {
    // 1. Load critical CSS first (blocking)
    await this.loadCriticalCSS();
    
    // 2. Load essential CSS (non-blocking)
    this.loadEssentialCSS();
    
    // 3. Preload optional CSS
    this.preloadOptionalCSS();
  }
  
  private async loadCriticalCSS(): Promise<void> {
    const criticalCSS = [
      'https://cdn.example.com/css/critical.css',
      'https://cdn.example.com/css/above-fold.css'
    ];
    
    await this.remoteCSSService.loadMultipleCSS(criticalCSS, {
      priority: 'high',
      cache: true,
      timeout: 3000
    });
  }
  
  private loadEssentialCSS(): void {
    const essentialCSS = [
      'https://cdn.example.com/css/layout.css',
      'https://cdn.example.com/css/components.css'
    ];
    
    // Load without blocking
    this.remoteCSSService.loadMultipleCSS(essentialCSS, {
      priority: 'medium',
      cache: true
    }).catch(error => {
      console.warn('Non-critical CSS failed to load:', error);
    });
  }
  
  private preloadOptionalCSS(): void {
    const optionalCSS = [
      'https://cdn.example.com/css/animations.css',
      'https://cdn.example.com/css/print.css'
    ];
    
    this.remoteCSSService.preloadCSS(optionalCSS, {
      priority: 'low',
      cache: true
    });
  }
}

// ❌ Bad: Loading all CSS at once
class BadCSSStrategy {
  async loadCSS(): Promise<void> {
    // Loading everything at once without prioritization
    const allCSS = [
      'https://cdn.example.com/css/normalize.css',
      'https://cdn.example.com/css/bootstrap.css',
      'https://cdn.example.com/css/components.css',
      'https://cdn.example.com/css/animations.css',
      'https://cdn.example.com/css/print.css',
      'https://cdn.example.com/css/admin.css'
      // ... many more
    ];
    
    // This blocks rendering and overwhelms the browser
    await Promise.all(allCSS.map(url => 
      this.remoteCSSService.loadCSS(url)
    ));
  }
}
```

### 2. Error Handling and Fallbacks

```typescript
// ✅ Good: Comprehensive error handling
class GoodErrorHandling {
  async loadCSSWithFallback(primaryUrl: string, fallbackUrl: string): Promise<void> {
    try {
      await this.remoteCSSService.loadCSS(primaryUrl, {
        timeout: 5000,
        retries: 2
      });
    } catch (primaryError) {
      console.warn(`Primary CSS failed (${primaryUrl}):`, primaryError.message);
      
      try {
        await this.remoteCSSService.loadCSS(fallbackUrl, {
          timeout: 10000,
          retries: 1
        });
        console.log('Fallback CSS loaded successfully');
      } catch (fallbackError) {
        console.error('Both primary and fallback CSS failed:', {
          primary: primaryError.message,
          fallback: fallbackError.message
        });
        
        // Load inline fallback CSS
        this.loadInlineFallbackCSS();
      }
    }
  }
  
  private loadInlineFallbackCSS(): void {
    const fallbackCSS = `
      body { font-family: Arial, sans-serif; }
      .container { max-width: 1200px; margin: 0 auto; padding: 1rem; }
      .btn { padding: 0.5rem 1rem; border: 1px solid #ccc; background: #f8f9fa; }
    `;
    
    const style = document.createElement('style');
    style.textContent = fallbackCSS;
    document.head.appendChild(style);
    
    console.log('Inline fallback CSS applied');
  }
}
```

### 3. Performance Optimization

```typescript
// ✅ Good: Performance-optimized CSS loading
class PerformanceOptimizedCSS {
  constructor(private remoteCSSService: RemoteCSSService) {
    this.setupPerformanceOptimizations();
  }
  
  private setupPerformanceOptimizations(): void {
    // Monitor CSS loading performance
    this.remoteCSSService.isLoading$.subscribe(loading => {
      if (loading) {
        this.startPerformanceMonitoring();
      } else {
        this.stopPerformanceMonitoring();
      }
    });
    
    // Setup intelligent preloading
    this.setupIntelligentPreloading();
  }
  
  private startPerformanceMonitoring(): void {
    const startTime = performance.now();
    
    const checkProgress = () => {
      const progress = this.remoteCSSService.getLoadingProgress();
      const elapsed = performance.now() - startTime;
      
      if (elapsed > 10000 && progress.percentage < 50) {
        console.warn('Slow CSS loading detected, optimizing...');
        this.optimizeCSSLoading();
      }
    };
    
    const interval = setInterval(checkProgress, 1000);
    
    this.remoteCSSService.isLoading$.subscribe(loading => {
      if (!loading) {
        clearInterval(interval);
      }
    });
  }
  
  private optimizeCSSLoading(): void {
    // Clear cache if it's causing issues
    const cacheStats = this.remoteCSSService.getCacheStats();
    if (cacheStats.hitRate < 0.5) {
      this.remoteCSSService.clearCache();
    }
    
    // Retry failed loads
    this.remoteCSSService.retryFailedLoads();
  }
  
  private setupIntelligentPreloading(): void {
    // Preload CSS based on user behavior
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && this.shouldPreloadCSS(link.href)) {
        this.preloadPageCSS(link.href);
      }
    });
  }
  
  private shouldPreloadCSS(href: string): boolean {
    return href.startsWith(window.location.origin) && 
           !href.includes('#') && 
           !this.remoteCSSService.isLoaded(this.getCSSUrlForPage(href));
  }
  
  private preloadPageCSS(href: string): void {
    const cssUrl = this.getCSSUrlForPage(href);
    if (cssUrl) {
      this.remoteCSSService.preloadCSS([cssUrl], {
        priority: 'low',
        cache: true
      });
    }
  }
  
  private getCSSUrlForPage(href: string): string | null {
    // Logic to determine CSS URL for a page
    const path = new URL(href).pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length > 0) {
      return `https://cdn.example.com/css/pages/${segments[0]}.css`;
    }
    
    return null;
  }
}
```

## Cân nhắc về hiệu suất

### 1. Loading Optimization
- Prioritize critical CSS và load non-critical CSS sau
- Sử dụng preloading cho frequently used CSS
- Implement intelligent caching strategies
- Monitor loading performance và adjust accordingly

### 2. Memory Management
- Clean up unused CSS regularly
- Implement cache size limits
- Remove unused stylesheets
- Monitor memory usage

### 3. Network Optimization
- Use appropriate timeout values
- Implement retry logic với exponential backoff
- Batch CSS requests khi có thể
- Use compression và caching headers

## Khắc phục sự cố

### Common Issues

**1. CSS Loading Timeout**
```typescript
// Increase timeout for slow networks
const options = {
  timeout: 30000, // 30 seconds
  retries: 3
};
```

**2. CORS Issues**
```typescript
// Handle CORS for external CSS
const options = {
  crossOrigin: 'anonymous'
};
```

**3. CSS Not Applying**
```typescript
// Check if CSS is loaded and applied
if (this.remoteCSSService.isLoaded(cssUrl)) {
  console.log('CSS is loaded but may have specificity issues');
  // Check CSS rules and specificity
}
```

**4. Cache Issues**
```typescript
// Clear cache if CSS is stale
this.remoteCSSService.clearCache();
// Or remove specific cached CSS
this.remoteCSSService.removeCachedCSS(url);
```

## Phụ thuộc

- `@angular/core`: Angular framework
- `@angular/common/http`: HTTP client
- `rxjs`: Reactive programming
- `PlatformService`: Platform detection
- `CacheService`: Caching functionality
- `LoaderService`: Resource loading

## Related Services

- **LoaderService**: General resource loading
- **CacheService**: CSS caching
- **PlatformService**: Platform detection
- **ThemeService**: Theme management
- **ConfigService**: Configuration management