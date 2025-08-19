# Config Merge Service - Application Configuration Management

## Giới thiệu

Config Merge Service là service cốt lõi để quản lý và truy cập cấu hình ứng dụng trong Angular. Service này cung cấp một interface thống nhất để truy cập các cấu hình từ nhiều nguồn khác nhau, bao gồm environment variables, runtime config, và default values.

## Tính năng chính

- **Centralized Configuration**: Quản lý tất cả cấu hình ở một nơi
- **Multi-source Merging**: Merge cấu hình từ nhiều nguồn
- **Type Safety**: Full TypeScript support với interfaces
- **Runtime Configuration**: Hỗ trợ cấu hình runtime từ server
- **Environment Specific**: Cấu hình khác nhau cho từng environment
- **Validation**: Validate cấu hình trước khi sử dụng
- **Hot Reload**: Hỗ trợ reload cấu hình trong development
- **Caching**: Cache cấu hình để tối ưu performance

## Configuration Structure

Service này quản lý các loại cấu hình sau:

```typescript
interface AppConfig {
  app: AppInfo;
  api: ApiConfig;
  messages: MessagesConfig;
  validation: ValidationConfig;
  ui: UiConfig;
  features: FeatureFlags;
  analytics: AnalyticsConfig;
  security: SecurityConfig;
}

interface AppInfo {
  name: string;
  version: string;
  environment: string;
  buildDate: string;
  description?: string;
  author?: string;
  homepage?: string;
}

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  endpoints: { [key: string]: string };
  headers: { [key: string]: string };
  enableCaching: boolean;
  cacheTimeout: number;
}

interface MessagesConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  fallbackLanguage: string;
  loadPath: string;
  enablePluralization: boolean;
}

interface ValidationConfig {
  enableClientSideValidation: boolean;
  showValidationSummary: boolean;
  validationDelay: number;
  customValidators: { [key: string]: any };
}

interface UiConfig {
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  enableAnimations: boolean;
  showLoadingSpinner: boolean;
  pageSize: number;
  enableResponsiveDesign: boolean;
}

interface FeatureFlags {
  enableNewDashboard: boolean;
  enableAdvancedSearch: boolean;
  enableSocialLogin: boolean;
  enablePushNotifications: boolean;
  enableOfflineMode: boolean;
}

interface AnalyticsConfig {
  enabled: boolean;
  trackingId: string;
  enableUserTracking: boolean;
  enablePerformanceTracking: boolean;
  sampleRate: number;
}

interface SecurityConfig {
  enableCSRF: boolean;
  enableXSS: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordPolicy: PasswordPolicy;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}
```

## API Reference

### Properties

| Property | Type | Mô tả |
|----------|------|-------|
| `config` | `AppConfig` | Complete application configuration |
| `isLoaded` | `boolean` | Configuration load status |
| `loadError` | `Error \| null` | Configuration load error |

### Methods

| Method | Signature | Mô tả |
|--------|-----------|-------|
| `getConfig()` | `getConfig(): AppConfig` | Lấy toàn bộ cấu hình |
| `getAppInfo()` | `getAppInfo(): AppInfo` | Lấy thông tin ứng dụng |
| `getApiConfig()` | `getApiConfig(): ApiConfig` | Lấy cấu hình API |
| `getMessagesConfig()` | `getMessagesConfig(): MessagesConfig` | Lấy cấu hình messages |
| `getValidationConfig()` | `getValidationConfig(): ValidationConfig` | Lấy cấu hình validation |
| `getUiConfig()` | `getUiConfig(): UiConfig` | Lấy cấu hình UI |
| `getFeatureFlags()` | `getFeatureFlags(): FeatureFlags` | Lấy feature flags |
| `isFeatureEnabled()` | `isFeatureEnabled(feature: string): boolean` | Kiểm tra feature có enabled |
| `updateConfig()` | `updateConfig(config: Partial<AppConfig>): void` | Cập nhật cấu hình |
| `reloadConfig()` | `reloadConfig(): Promise<void>` | Reload cấu hình từ server |
| `validateConfig()` | `validateConfig(): boolean` | Validate cấu hình |

## Implementation Details

### Service Structure

```typescript
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ENVIRONMENT, IEnvironment } from '../providers/environment.provider';
import { WINDOW_SERVICE, WindowService } from './window.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigMergeService {
  private _config: AppConfig;
  private _isLoaded = false;
  private _loadError: Error | null = null;
  private _configSubject = new BehaviorSubject<AppConfig | null>(null);

  constructor(
    @Inject(ENVIRONMENT) private environment: IEnvironment,
    @Inject(WINDOW_SERVICE) private windowService: WindowService,
    private http: HttpClient
  ) {
    this.initializeConfig();
  }

  private async initializeConfig(): Promise<void> {
    try {
      // 1. Load default configuration
      const defaultConfig = this.getDefaultConfig();
      
      // 2. Load environment-specific configuration
      const envConfig = this.getEnvironmentConfig();
      
      // 3. Load runtime configuration from server
      const runtimeConfig = await this.loadRuntimeConfig();
      
      // 4. Load configuration from window object (if available)
      const windowConfig = this.getWindowConfig();
      
      // 5. Merge all configurations
      this._config = this.mergeConfigurations([
        defaultConfig,
        envConfig,
        runtimeConfig,
        windowConfig
      ]);
      
      // 6. Validate merged configuration
      if (this.validateConfig()) {
        this._isLoaded = true;
        this._configSubject.next(this._config);
      } else {
        throw new Error('Configuration validation failed');
      }
    } catch (error) {
      this._loadError = error as Error;
      console.error('Failed to initialize configuration:', error);
      
      // Use fallback configuration
      this._config = this.getFallbackConfig();
      this._isLoaded = true;
      this._configSubject.next(this._config);
    }
  }

  // Configuration getters
  get config(): AppConfig {
    return this._config;
  }

  get isLoaded(): boolean {
    return this._isLoaded;
  }

  get loadError(): Error | null {
    return this._loadError;
  }

  // Public methods
  getConfig(): AppConfig {
    return this._config;
  }

  getAppInfo(): AppInfo {
    return this._config.app;
  }

  getApiConfig(): ApiConfig {
    return this._config.api;
  }

  getMessagesConfig(): MessagesConfig {
    return this._config.messages;
  }

  getValidationConfig(): ValidationConfig {
    return this._config.validation;
  }

  getUiConfig(): UiConfig {
    return this._config.ui;
  }

  getFeatureFlags(): FeatureFlags {
    return this._config.features;
  }

  isFeatureEnabled(feature: string): boolean {
    return this._config.features[feature] === true;
  }

  // Configuration management
  updateConfig(config: Partial<AppConfig>): void {
    this._config = this.mergeConfigurations([this._config, config]);
    this._configSubject.next(this._config);
  }

  async reloadConfig(): Promise<void> {
    this._isLoaded = false;
    this._loadError = null;
    await this.initializeConfig();
  }

  validateConfig(): boolean {
    try {
      // Validate required fields
      if (!this._config.app.name || !this._config.app.version) {
        console.error('Missing required app information');
        return false;
      }

      if (!this._config.api.baseUrl) {
        console.error('Missing API base URL');
        return false;
      }

      // Validate API timeout
      if (this._config.api.timeout <= 0) {
        console.error('Invalid API timeout value');
        return false;
      }

      // Validate supported languages
      if (!this._config.messages.supportedLanguages.includes(this._config.messages.defaultLanguage)) {
        console.error('Default language not in supported languages list');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Configuration validation error:', error);
      return false;
    }
  }

  // Observable configuration
  getConfig$(): Observable<AppConfig | null> {
    return this._configSubject.asObservable();
  }

  // Private helper methods
  private getDefaultConfig(): AppConfig {
    return {
      app: {
        name: 'CCI Web Application',
        version: '1.0.0',
        environment: 'development',
        buildDate: new Date().toISOString(),
        description: 'CCI Web Application',
        author: 'CCI Team'
      },
      api: {
        baseUrl: 'http://localhost:3000/api',
        timeout: 30000,
        retryAttempts: 3,
        endpoints: {},
        headers: {
          'Content-Type': 'application/json'
        },
        enableCaching: true,
        cacheTimeout: 300000
      },
      messages: {
        defaultLanguage: 'vi',
        supportedLanguages: ['vi', 'en'],
        fallbackLanguage: 'en',
        loadPath: '/assets/i18n/{{lng}}.json',
        enablePluralization: true
      },
      validation: {
        enableClientSideValidation: true,
        showValidationSummary: true,
        validationDelay: 300,
        customValidators: {}
      },
      ui: {
        theme: 'default',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        enableAnimations: true,
        showLoadingSpinner: true,
        pageSize: 20,
        enableResponsiveDesign: true
      },
      features: {
        enableNewDashboard: false,
        enableAdvancedSearch: true,
        enableSocialLogin: false,
        enablePushNotifications: false,
        enableOfflineMode: false
      },
      analytics: {
        enabled: false,
        trackingId: '',
        enableUserTracking: false,
        enablePerformanceTracking: false,
        sampleRate: 0.1
      },
      security: {
        enableCSRF: true,
        enableXSS: true,
        sessionTimeout: 1800000, // 30 minutes
        maxLoginAttempts: 5,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false
        }
      }
    };
  }

  private getEnvironmentConfig(): Partial<AppConfig> {
    return {
      app: {
        environment: this.environment.production ? 'production' : 'development'
      },
      api: {
        baseUrl: this.environment.apiUrl || 'http://localhost:3000/api'
      },
      analytics: {
        enabled: this.environment.production,
        trackingId: this.environment.analyticsId || ''
      }
    };
  }

  private async loadRuntimeConfig(): Promise<Partial<AppConfig>> {
    try {
      const runtimeConfig = await this.http.get<Partial<AppConfig>>('/api/config').toPromise();
      return runtimeConfig || {};
    } catch (error) {
      console.warn('Failed to load runtime configuration:', error);
      return {};
    }
  }

  private getWindowConfig(): Partial<AppConfig> {
    try {
      const window = this.windowService.getWindow();
      if (window && (window as any).__CONFIG_APP__) {
        return (window as any).__CONFIG_APP__;
      }
      return {};
    } catch (error) {
      console.warn('Failed to load window configuration:', error);
      return {};
    }
  }

  private mergeConfigurations(configs: (AppConfig | Partial<AppConfig>)[]): AppConfig {
    return configs.reduce((merged, config) => {
      return this.deepMerge(merged, config);
    }, {} as AppConfig);
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  private getFallbackConfig(): AppConfig {
    // Return minimal working configuration
    return this.getDefaultConfig();
  }
}
```

## Cách sử dụng

### Basic Configuration Access

```typescript
import { Component, OnInit } from '@angular/core';
import { ConfigMergeService } from '@cci-web/core';

@Component({
  selector: 'app-config-demo',
  template: `
    <div class="config-info">
      <h2>Application Configuration</h2>
      
      <div class="app-info">
        <h3>App Info</h3>
        <p>Name: {{ appInfo.name }}</p>
        <p>Version: {{ appInfo.version }}</p>
        <p>Environment: {{ appInfo.environment }}</p>
        <p>Build Date: {{ appInfo.buildDate | date }}</p>
      </div>
      
      <div class="api-config">
        <h3>API Configuration</h3>
        <p>Base URL: {{ apiConfig.baseUrl }}</p>
        <p>Timeout: {{ apiConfig.timeout }}ms</p>
        <p>Caching: {{ apiConfig.enableCaching ? 'Enabled' : 'Disabled' }}</p>
      </div>
      
      <div class="feature-flags">
        <h3>Feature Flags</h3>
        <ul>
          <li *ngFor="let feature of featureList">
            {{ feature.name }}: 
            <span [class.enabled]="feature.enabled" [class.disabled]="!feature.enabled">
              {{ feature.enabled ? 'Enabled' : 'Disabled' }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .enabled { color: green; font-weight: bold; }
    .disabled { color: red; }
    .config-info { padding: 20px; }
    .app-info, .api-config, .feature-flags { margin-bottom: 20px; }
  `]
})
export class ConfigDemoComponent implements OnInit {
  appInfo: any;
  apiConfig: any;
  featureList: { name: string; enabled: boolean }[] = [];

  constructor(private configService: ConfigMergeService) {}

  ngOnInit() {
    // Wait for configuration to load
    if (this.configService.isLoaded) {
      this.loadConfiguration();
    } else {
      // Subscribe to configuration changes
      this.configService.getConfig$().subscribe(config => {
        if (config) {
          this.loadConfiguration();
        }
      });
    }
  }

  private loadConfiguration() {
    this.appInfo = this.configService.getAppInfo();
    this.apiConfig = this.configService.getApiConfig();
    
    const features = this.configService.getFeatureFlags();
    this.featureList = Object.keys(features).map(key => ({
      name: key,
      enabled: features[key]
    }));
  }
}
```

### Feature Flag Service

```typescript
import { Injectable } from '@angular/core';
import { ConfigMergeService } from '@cci-web/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  constructor(private configService: ConfigMergeService) {}

  isFeatureEnabled(feature: string): boolean {
    return this.configService.isFeatureEnabled(feature);
  }

  isFeatureEnabled$(feature: string): Observable<boolean> {
    return this.configService.getConfig$().pipe(
      map(config => config?.features[feature] === true)
    );
  }

  getEnabledFeatures(): string[] {
    const features = this.configService.getFeatureFlags();
    return Object.keys(features).filter(key => features[key]);
  }

  // Specific feature checks
  canUseNewDashboard(): boolean {
    return this.isFeatureEnabled('enableNewDashboard');
  }

  canUseAdvancedSearch(): boolean {
    return this.isFeatureEnabled('enableAdvancedSearch');
  }

  canUseSocialLogin(): boolean {
    return this.isFeatureEnabled('enableSocialLogin');
  }

  canUsePushNotifications(): boolean {
    return this.isFeatureEnabled('enablePushNotifications');
  }

  canUseOfflineMode(): boolean {
    return this.isFeatureEnabled('enableOfflineMode');
  }
}
```

### Configuration-based HTTP Interceptor

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';
import { ConfigMergeService } from '@cci-web/core';

@Injectable()
export class ConfigHttpInterceptor implements HttpInterceptor {
  constructor(private configService: ConfigMergeService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const apiConfig = this.configService.getApiConfig();
    
    // Add configured headers
    let modifiedReq = req;
    if (apiConfig.headers) {
      const headers = req.headers;
      Object.keys(apiConfig.headers).forEach(key => {
        if (!headers.has(key)) {
          modifiedReq = modifiedReq.clone({
            headers: headers.set(key, apiConfig.headers[key])
          });
        }
      });
    }

    // Apply timeout and retry based on configuration
    return next.handle(modifiedReq).pipe(
      timeout(apiConfig.timeout),
      retry(apiConfig.retryAttempts)
    );
  }
}
```

### Theme Service với Configuration

```typescript
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { ConfigMergeService } from '@cci-web/core';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;

  constructor(
    private configService: ConfigMergeService,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const uiConfig = this.configService.getUiConfig();
    
    // Apply theme
    this.setTheme(uiConfig.theme);
    
    // Apply colors
    this.setPrimaryColor(uiConfig.primaryColor);
    this.setSecondaryColor(uiConfig.secondaryColor);
    
    // Apply animations setting
    this.setAnimationsEnabled(uiConfig.enableAnimations);
  }

  setTheme(theme: string): void {
    this.renderer.setAttribute(this.document.body, 'data-theme', theme);
  }

  setPrimaryColor(color: string): void {
    this.renderer.setStyle(this.document.documentElement, '--primary-color', color);
  }

  setSecondaryColor(color: string): void {
    this.renderer.setStyle(this.document.documentElement, '--secondary-color', color);
  }

  setAnimationsEnabled(enabled: boolean): void {
    if (enabled) {
      this.renderer.removeClass(this.document.body, 'no-animations');
    } else {
      this.renderer.addClass(this.document.body, 'no-animations');
    }
  }

  updateThemeFromConfig(): void {
    this.initializeTheme();
  }
}
```

### Validation Service với Configuration

```typescript
import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { ConfigMergeService } from '@cci-web/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  constructor(private configService: ConfigMergeService) {}

  // Password validator based on configuration
  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const securityConfig = this.configService.getConfig().security;
      const policy = securityConfig.passwordPolicy;
      const errors: ValidationErrors = {};

      // Check minimum length
      if (value.length < policy.minLength) {
        errors['minLength'] = {
          requiredLength: policy.minLength,
          actualLength: value.length
        };
      }

      // Check uppercase requirement
      if (policy.requireUppercase && !/[A-Z]/.test(value)) {
        errors['requireUppercase'] = true;
      }

      // Check lowercase requirement
      if (policy.requireLowercase && !/[a-z]/.test(value)) {
        errors['requireLowercase'] = true;
      }

      // Check numbers requirement
      if (policy.requireNumbers && !/\d/.test(value)) {
        errors['requireNumbers'] = true;
      }

      // Check special characters requirement
      if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        errors['requireSpecialChars'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  // Get validation delay from configuration
  getValidationDelay(): number {
    return this.configService.getValidationConfig().validationDelay;
  }

  // Check if client-side validation is enabled
  isClientSideValidationEnabled(): boolean {
    return this.configService.getValidationConfig().enableClientSideValidation;
  }

  // Check if validation summary should be shown
  shouldShowValidationSummary(): boolean {
    return this.configService.getValidationConfig().showValidationSummary;
  }
}
```

### Dynamic Configuration Update

```typescript
import { Component } from '@angular/core';
import { ConfigMergeService } from '@cci-web/core';

@Component({
  selector: 'app-config-admin',
  template: `
    <div class="config-admin">
      <h2>Configuration Management</h2>
      
      <div class="config-section">
        <h3>UI Configuration</h3>
        <label>
          Theme:
          <select [(ngModel)]="uiConfig.theme" (change)="updateUiConfig()">
            <option value="default">Default</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
        
        <label>
          Primary Color:
          <input type="color" [(ngModel)]="uiConfig.primaryColor" (change)="updateUiConfig()">
        </label>
        
        <label>
          <input type="checkbox" [(ngModel)]="uiConfig.enableAnimations" (change)="updateUiConfig()">
          Enable Animations
        </label>
      </div>
      
      <div class="config-section">
        <h3>Feature Flags</h3>
        <label *ngFor="let feature of featureKeys">
          <input 
            type="checkbox" 
            [(ngModel)]="features[feature]" 
            (change)="updateFeatures()">
          {{ feature }}
        </label>
      </div>
      
      <div class="config-actions">
        <button (click)="reloadConfig()" [disabled]="isReloading">
          {{ isReloading ? 'Reloading...' : 'Reload Configuration' }}
        </button>
        
        <button (click)="resetToDefaults()">
          Reset to Defaults
        </button>
      </div>
    </div>
  `,
  styles: [`
    .config-admin { padding: 20px; }
    .config-section { margin-bottom: 30px; }
    .config-section label { display: block; margin-bottom: 10px; }
    .config-actions button { margin-right: 10px; }
  `]
})
export class ConfigAdminComponent {
  uiConfig: any;
  features: any;
  featureKeys: string[];
  isReloading = false;

  constructor(private configService: ConfigMergeService) {
    this.loadCurrentConfig();
  }

  private loadCurrentConfig(): void {
    this.uiConfig = { ...this.configService.getUiConfig() };
    this.features = { ...this.configService.getFeatureFlags() };
    this.featureKeys = Object.keys(this.features);
  }

  updateUiConfig(): void {
    this.configService.updateConfig({
      ui: this.uiConfig
    });
  }

  updateFeatures(): void {
    this.configService.updateConfig({
      features: this.features
    });
  }

  async reloadConfig(): Promise<void> {
    this.isReloading = true;
    try {
      await this.configService.reloadConfig();
      this.loadCurrentConfig();
    } catch (error) {
      console.error('Failed to reload configuration:', error);
    } finally {
      this.isReloading = false;
    }
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all configuration to defaults?')) {
      // This would typically call an API to reset server-side config
      // For now, just reload the page
      window.location.reload();
    }
  }
}
```

## Best Practices

### 1. Configuration Validation

```typescript
// ✅ Good: Validate configuration before use
class ApiService {
  constructor(private configService: ConfigMergeService) {
    const apiConfig = this.configService.getApiConfig();
    
    if (!apiConfig.baseUrl) {
      throw new Error('API base URL is required');
    }
    
    if (apiConfig.timeout <= 0) {
      console.warn('Invalid API timeout, using default');
      apiConfig.timeout = 30000;
    }
  }
}
```

### 2. Environment-specific Configuration

```typescript
// ✅ Good: Environment-aware configuration
class AnalyticsService {
  constructor(private configService: ConfigMergeService) {
    const analyticsConfig = this.configService.getConfig().analytics;
    
    // Only enable analytics in production
    if (analyticsConfig.enabled && this.configService.getAppInfo().environment === 'production') {
      this.initializeAnalytics(analyticsConfig.trackingId);
    }
  }
}
```

### 3. Feature Flag Usage

```typescript
// ✅ Good: Feature flag with fallback
@Component({
  template: `
    <div class="dashboard">
      <div *ngIf="useNewDashboard; else oldDashboard">
        <app-new-dashboard></app-new-dashboard>
      </div>
      
      <ng-template #oldDashboard>
        <app-old-dashboard></app-old-dashboard>
      </ng-template>
    </div>
  `
})
export class DashboardComponent {
  useNewDashboard: boolean;

  constructor(private configService: ConfigMergeService) {
    this.useNewDashboard = this.configService.isFeatureEnabled('enableNewDashboard');
  }
}
```

### 4. Configuration Caching

```typescript
// ✅ Good: Cache frequently accessed configuration
class CachedConfigService {
  private _apiConfig: ApiConfig;
  private _uiConfig: UiConfig;

  constructor(private configService: ConfigMergeService) {
    // Cache on initialization
    this._apiConfig = this.configService.getApiConfig();
    this._uiConfig = this.configService.getUiConfig();
    
    // Update cache when configuration changes
    this.configService.getConfig$().subscribe(config => {
      if (config) {
        this._apiConfig = config.api;
        this._uiConfig = config.ui;
      }
    });
  }

  get apiConfig(): ApiConfig {
    return this._apiConfig;
  }

  get uiConfig(): UiConfig {
    return this._uiConfig;
  }
}
```

## Performance Considerations

### 1. Lazy Loading
- Configuration được load một lần khi service khởi tạo
- Sử dụng caching để tránh multiple API calls
- Lazy load runtime configuration khi cần thiết

### 2. Memory Management
- Service được provide ở root level (singleton)
- Configuration được cache trong memory
- Proper cleanup cho subscriptions

### 3. Network Optimization
- Batch load multiple configuration sources
- Use HTTP caching headers cho runtime config
- Implement retry logic cho failed requests

## Troubleshooting

### Common Issues

**1. Configuration Not Loading**
```typescript
// Check configuration load status
if (!this.configService.isLoaded) {
  console.error('Configuration not loaded:', this.configService.loadError);
}
```

**2. Missing Configuration Values**
```typescript
// Provide fallback values
const apiTimeout = this.configService.getApiConfig().timeout || 30000;
```

**3. Runtime Configuration Errors**
```typescript
// Handle runtime config failures gracefully
try {
  await this.configService.reloadConfig();
} catch (error) {
  console.warn('Using cached configuration due to reload failure:', error);
}
```

## Dependencies

- `@angular/core`: Angular framework
- `@angular/common/http`: HTTP client for runtime config
- `rxjs`: Reactive programming
- `@cci-web/core`: Internal services (WindowService)

## Related Services

- **WindowService**: Access to window configuration
- **Environment Provider**: Environment-specific settings
- **ThemeService**: UI configuration application
- **FeatureFlagService**: Feature flag management