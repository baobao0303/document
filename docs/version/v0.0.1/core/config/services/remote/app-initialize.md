# App Initialize Service - Application Initialization Service

## Giới thiệu

App Initialize Service là service chuyên dụng để quản lý quá trình khởi tạo ứng dụng Angular. Service này đảm bảo rằng tất cả các dependencies, configurations, và resources cần thiết được load và setup đúng cách trước khi ứng dụng bắt đầu hoạt động.

## Tính năng chính

- **Application Bootstrap**: Quản lý quá trình khởi tạo ứng dụng
- **Dependency Loading**: Load các dependencies cần thiết
- **Configuration Setup**: Setup cấu hình ứng dụng
- **Resource Preloading**: Preload các resources quan trọng
- **Error Handling**: Xử lý lỗi trong quá trình khởi tạo
- **Progress Tracking**: Theo dõi tiến trình khởi tạo
- **Async Initialization**: Hỗ trợ khởi tạo bất đồng bộ
- **Retry Logic**: Thử lại khi khởi tạo thất bại
- **Health Checks**: Kiểm tra sức khỏe hệ thống
- **Environment Detection**: Phát hiện môi trường runtime
- **Feature Flags**: Quản lý feature flags
- **Service Registration**: Đăng ký các services động

## Phụ thuộc

Service này phụ thuộc vào các Angular modules và services:

```typescript
import { Injectable, Inject, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, throwError, timer } from 'rxjs';
import { map, catchError, retry, timeout, switchMap, tap } from 'rxjs/operators';
import { ConfigService } from '../common/config.service';
import { PlatformService } from '../common/platform.service';
import { LoaderService } from './loader.service';
```

## Tham chiếu API

### Thuộc tính

| Thuộc tính | Kiểu | Mô tả |
|----------|------|-------|
| `isInitialized$` | `Observable<boolean>` | Observable cho trạng thái khởi tạo |
| `initializationProgress$` | `Observable<InitializationProgress>` | Observable cho tiến trình khởi tạo |
| `initializationError$` | `Observable<Error \| null>` | Observable cho lỗi khởi tạo |
| `isInitialized` | `boolean` | Trạng thái khởi tạo hiện tại |
| `initializationStartTime` | `number` | Thời gian bắt đầu khởi tạo |
| `initializationEndTime` | `number` | Thời gian kết thúc khởi tạo |

### Phương thức khởi tạo cốt lõi

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `initialize()` | `initialize(): Promise<boolean>` | Khởi tạo ứng dụng |
| `initializeAsync()` | `initializeAsync(): Observable<boolean>` | Khởi tạo bất đồng bộ |
| `reinitialize()` | `reinitialize(): Promise<boolean>` | Khởi tạo lại ứng dụng |
| `getInitializationStatus()` | `getInitializationStatus(): InitializationStatus` | Lấy trạng thái khởi tạo |
| `waitForInitialization()` | `waitForInitialization(): Promise<boolean>` | Chờ quá trình khởi tạo hoàn thành |

### Phương thức cấu hình

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `loadConfiguration()` | `loadConfiguration(): Promise<AppConfig>` | Load cấu hình ứng dụng |
| `loadEnvironmentConfig()` | `loadEnvironmentConfig(): Promise<EnvironmentConfig>` | Load cấu hình môi trường |
| `loadFeatureFlags()` | `loadFeatureFlags(): Promise<FeatureFlags>` | Load feature flags |
| `validateConfiguration()` | `validateConfiguration(config: AppConfig): boolean` | Validate cấu hình |
| `mergeConfigurations()` | `mergeConfigurations(configs: AppConfig[]): AppConfig` | Merge nhiều cấu hình |

### Phương thức tải Resource

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `preloadResources()` | `preloadResources(): Promise<void>` | Preload resources |
| `loadCriticalResources()` | `loadCriticalResources(): Promise<void>` | Load resources quan trọng |
| `loadTranslations()` | `loadTranslations(): Promise<void>` | Load translations |
| `loadThemes()` | `loadThemes(): Promise<void>` | Load themes |
| `loadPlugins()` | `loadPlugins(): Promise<void>` | Load plugins |

### Phương thức đăng ký Service

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `registerServices()` | `registerServices(): Promise<void>` | Đăng ký services |
| `registerProviders()` | `registerProviders(providers: Provider[]): void` | Đăng ký providers |
| `registerInterceptors()` | `registerInterceptors(): void` | Đăng ký interceptors |
| `registerGuards()` | `registerGuards(): void` | Đăng ký route guards |
| `registerResolvers()` | `registerResolvers(): void` | Đăng ký resolvers |

### Phương thức kiểm tra sức khỏe

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `performHealthChecks()` | `performHealthChecks(): Promise<HealthCheckResult>` | Thực hiện health checks |
| `checkDatabaseConnection()` | `checkDatabaseConnection(): Promise<boolean>` | Kiểm tra kết nối database |
| `checkApiEndpoints()` | `checkApiEndpoints(): Promise<boolean>` | Kiểm tra API endpoints |
| `checkExternalServices()` | `checkExternalServices(): Promise<boolean>` | Kiểm tra external services |
| `getHealthStatus()` | `getHealthStatus(): HealthStatus` | Lấy trạng thái sức khỏe |

### Phương thức xử lý lỗi

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `handleInitializationError()` | `handleInitializationError(error: Error): void` | Xử lý lỗi khởi tạo |
| `retryInitialization()` | `retryInitialization(maxRetries?: number): Promise<boolean>` | Thử lại khởi tạo |
| `rollbackInitialization()` | `rollbackInitialization(): Promise<void>` | Rollback khởi tạo |
| `getInitializationErrors()` | `getInitializationErrors(): Error[]` | Lấy danh sách lỗi |
| `clearInitializationErrors()` | `clearInitializationErrors(): void` | Xóa lỗi khởi tạo |

### Phương thức tiện ích

| Phương thức | Chữ ký | Mô tả |
|--------|-----------|-------|
| `getInitializationTime()` | `getInitializationTime(): number` | Lấy thời gian khởi tạo |
| `getInitializationSteps()` | `getInitializationSteps(): InitializationStep[]` | Lấy các bước khởi tạo |
| `addInitializationStep()` | `addInitializationStep(step: InitializationStep): void` | Thêm bước khởi tạo |
| `removeInitializationStep()` | `removeInitializationStep(stepId: string): void` | Xóa bước khởi tạo |
| `getInitializationMetrics()` | `getInitializationMetrics(): InitializationMetrics` | Lấy metrics khởi tạo |

## Chi tiết triển khai

### Interfaces

```typescript
interface InitializationProgress {
  currentStep: string;
  completedSteps: number;
  totalSteps: number;
  percentage: number;
  message: string;
  startTime: number;
  estimatedTimeRemaining?: number;
}

interface InitializationStatus {
  isInitialized: boolean;
  isInitializing: boolean;
  hasErrors: boolean;
  progress: InitializationProgress;
  errors: Error[];
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface AppConfig {
  apiBaseUrl: string;
  environment: string;
  version: string;
  features: FeatureFlags;
  theme: ThemeConfig;
  localization: LocalizationConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
  logging: LoggingConfig;
  analytics: AnalyticsConfig;
}

interface EnvironmentConfig {
  name: string;
  production: boolean;
  debug: boolean;
  apiUrl: string;
  cdnUrl: string;
  assetsUrl: string;
  socketUrl: string;
  authUrl: string;
  variables: Record<string, any>;
}

interface FeatureFlags {
  [key: string]: boolean | string | number;
}

interface ThemeConfig {
  defaultTheme: string;
  availableThemes: string[];
  darkModeSupport: boolean;
  customCssVariables: Record<string, string>;
}

interface LocalizationConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  fallbackLanguage: string;
  dateFormat: string;
  numberFormat: string;
  currencyFormat: string;
}

interface SecurityConfig {
  enableCSP: boolean;
  enableCORS: boolean;
  tokenExpiration: number;
  refreshTokenExpiration: number;
  encryptionKey: string;
  allowedOrigins: string[];
}

interface PerformanceConfig {
  enableLazyLoading: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
  enableCompression: boolean;
  enableMinification: boolean;
  bundleSize: number;
}

interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  remoteLoggingUrl?: string;
  maxLogSize: number;
  logRetention: number;
}

interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  enableUserTracking: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  samplingRate: number;
}

interface InitializationStep {
  id: string;
  name: string;
  description: string;
  priority: number;
  required: boolean;
  timeout: number;
  retryCount: number;
  dependencies: string[];
  execute: () => Promise<any>;
  validate?: (result: any) => boolean;
  rollback?: () => Promise<void>;
}

interface HealthCheckResult {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: number;
  duration: number;
}

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration: number;
  data?: any;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: number;
  uptime: number;
  version: string;
  environment: string;
  services: ServiceStatus[];
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  lastCheck: number;
  responseTime: number;
  errorRate: number;
}

interface InitializationMetrics {
  totalTime: number;
  stepTimes: Record<string, number>;
  memoryUsage: number;
  resourcesLoaded: number;
  errorsCount: number;
  retryCount: number;
  cacheHitRate: number;
}

interface AppInitializeConfig {
  enableProgressTracking: boolean;
  enableHealthChecks: boolean;
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  enableRollback: boolean;
  enableMetrics: boolean;
  enableLogging: boolean;
  criticalStepsOnly: boolean;
}
```

### Cấu trúc Service

```typescript
import { Injectable, Inject, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin, of, throwError, timer } from 'rxjs';
import { map, catchError, retry, timeout, switchMap, tap, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppInitializeService {
  private readonly _config: AppInitializeConfig;
  
  // State management
  private _isInitialized = false;
  private _isInitializing = false;
  private _initializationStartTime = 0;
  private _initializationEndTime = 0;
  private _initializationSteps: InitializationStep[] = [];
  private _initializationErrors: Error[] = [];
  
  // Subjects for reactive state
  private _isInitialized$ = new BehaviorSubject<boolean>(false);
  private _initializationProgress$ = new BehaviorSubject<InitializationProgress>({
    currentStep: '',
    completedSteps: 0,
    totalSteps: 0,
    percentage: 0,
    message: 'Initializing...',
    startTime: 0
  });
  private _initializationError$ = new BehaviorSubject<Error | null>(null);
  
  // Public observables
  public isInitialized$ = this._isInitialized$.asObservable();
  public initializationProgress$ = this._initializationProgress$.asObservable();
  public initializationError$ = this._initializationError$.asObservable();
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private platformService: PlatformService,
    private loaderService: LoaderService,
    config?: Partial<AppInitializeConfig>
  ) {
    this._config = this.mergeConfig(this.getDefaultConfig(), config);
    this.setupDefaultInitializationSteps();
  }

  private getDefaultConfig(): AppInitializeConfig {
    return {
      enableProgressTracking: true,
      enableHealthChecks: true,
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      enableRollback: true,
      enableMetrics: true,
      enableLogging: true,
      criticalStepsOnly: false
    };
  }

  private mergeConfig(defaultConfig: AppInitializeConfig, userConfig?: Partial<AppInitializeConfig>): AppInitializeConfig {
    return { ...defaultConfig, ...userConfig };
  }

  private setupDefaultInitializationSteps(): void {
    const defaultSteps: InitializationStep[] = [
      {
        id: 'platform-detection',
        name: 'Platform Detection',
        description: 'Detect runtime platform and capabilities',
        priority: 1,
        required: true,
        timeout: 5000,
        retryCount: 0,
        dependencies: [],
        execute: () => this.detectPlatform()
      },
      {
        id: 'load-configuration',
        name: 'Load Configuration',
        description: 'Load application configuration',
        priority: 2,
        required: true,
        timeout: 10000,
        retryCount: 2,
        dependencies: ['platform-detection'],
        execute: () => this.loadConfiguration()
      },
      {
        id: 'load-environment',
        name: 'Load Environment',
        description: 'Load environment-specific configuration',
        priority: 3,
        required: true,
        timeout: 5000,
        retryCount: 2,
        dependencies: ['load-configuration'],
        execute: () => this.loadEnvironmentConfig()
      },
      {
        id: 'load-feature-flags',
        name: 'Load Feature Flags',
        description: 'Load feature flags configuration',
        priority: 4,
        required: false,
        timeout: 5000,
        retryCount: 1,
        dependencies: ['load-configuration'],
        execute: () => this.loadFeatureFlags()
      },
      {
        id: 'register-services',
        name: 'Register Services',
        description: 'Register application services',
        priority: 5,
        required: true,
        timeout: 10000,
        retryCount: 1,
        dependencies: ['load-configuration'],
        execute: () => this.registerServices()
      },
      {
        id: 'preload-resources',
        name: 'Preload Resources',
        description: 'Preload critical resources',
        priority: 6,
        required: false,
        timeout: 15000,
        retryCount: 1,
        dependencies: ['load-configuration'],
        execute: () => this.preloadResources()
      },
      {
        id: 'health-checks',
        name: 'Health Checks',
        description: 'Perform system health checks',
        priority: 7,
        required: false,
        timeout: 10000,
        retryCount: 1,
        dependencies: ['register-services'],
        execute: () => this.performHealthChecks()
      }
    ];
    
    this._initializationSteps = defaultSteps;
  }

  // Public getters
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  get initializationStartTime(): number {
    return this._initializationStartTime;
  }

  get initializationEndTime(): number {
    return this._initializationEndTime;
  }

  // Core Initialization Methods
  async initialize(): Promise<boolean> {
    if (this._isInitialized) {
      return true;
    }
    
    if (this._isInitializing) {
      return this.waitForInitialization();
    }
    
    this._isInitializing = true;
    this._initializationStartTime = Date.now();
    this._initializationErrors = [];
    
    try {
      this.updateProgress('Starting initialization...', 0, 0);
      
      const steps = this.getOrderedSteps();
      const totalSteps = steps.length;
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        try {
          this.updateProgress(`Executing: ${step.name}`, i, totalSteps, step.description);
          
          await this.executeStepWithRetry(step);
          
          this.updateProgress(`Completed: ${step.name}`, i + 1, totalSteps);
          
        } catch (error) {
          const stepError = new Error(`Failed to execute step '${step.name}': ${error.message}`);
          this._initializationErrors.push(stepError);
          
          if (step.required) {
            throw stepError;
          } else {
            console.warn(`Non-critical step '${step.name}' failed:`, error);
          }
        }
      }
      
      this._isInitialized = true;
      this._initializationEndTime = Date.now();
      this._isInitialized$.next(true);
      
      this.updateProgress('Initialization completed', totalSteps, totalSteps);
      
      if (this._config.enableLogging) {
        console.log('Application initialization completed successfully', {
          duration: this.getInitializationTime(),
          steps: totalSteps,
          errors: this._initializationErrors.length
        });
      }
      
      return true;
      
    } catch (error) {
      this._initializationError$.next(error);
      
      if (this._config.enableRollback) {
        await this.rollbackInitialization();
      }
      
      if (this._config.enableRetry && this._initializationErrors.length < this._config.maxRetries) {
        console.warn('Initialization failed, retrying...', error);
        await this.delay(this._config.retryDelay);
        return this.retryInitialization();
      }
      
      throw error;
      
    } finally {
      this._isInitializing = false;
    }
  }

  initializeAsync(): Observable<boolean> {
    return new Observable(observer => {
      this.initialize()
        .then(result => {
          observer.next(result);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  async reinitialize(): Promise<boolean> {
    this._isInitialized = false;
    this._isInitialized$.next(false);
    this._initializationErrors = [];
    this._initializationError$.next(null);
    
    return this.initialize();
  }

  getInitializationStatus(): InitializationStatus {
    return {
      isInitialized: this._isInitialized,
      isInitializing: this._isInitializing,
      hasErrors: this._initializationErrors.length > 0,
      progress: this._initializationProgress$.value,
      errors: [...this._initializationErrors],
      startTime: this._initializationStartTime,
      endTime: this._initializationEndTime || undefined,
      duration: this._initializationEndTime ? this._initializationEndTime - this._initializationStartTime : undefined
    };
  }

  async waitForInitialization(): Promise<boolean> {
    if (this._isInitialized) {
      return true;
    }
    
    return new Promise((resolve, reject) => {
      const subscription = this.isInitialized$.subscribe({
        next: (initialized) => {
          if (initialized) {
            subscription.unsubscribe();
            resolve(true);
          }
        },
        error: (error) => {
          subscription.unsubscribe();
          reject(error);
        }
      });
      
      // Timeout protection
      setTimeout(() => {
        subscription.unsubscribe();
        reject(new Error('Initialization timeout'));
      }, this._config.timeout);
    });
  }

  // Configuration Methods
  async loadConfiguration(): Promise<AppConfig> {
    try {
      const configUrl = this.getConfigurationUrl();
      const config = await this.http.get<AppConfig>(configUrl).toPromise();
      
      if (!this.validateConfiguration(config)) {
        throw new Error('Invalid configuration format');
      }
      
      this.configService.setConfig(config);
      return config;
      
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }

  async loadEnvironmentConfig(): Promise<EnvironmentConfig> {
    try {
      const environment = this.detectEnvironment();
      const envConfigUrl = `/assets/config/environment.${environment}.json`;
      
      const envConfig = await this.http.get<EnvironmentConfig>(envConfigUrl).toPromise();
      
      this.configService.setEnvironmentConfig(envConfig);
      return envConfig;
      
    } catch (error) {
      console.warn('Failed to load environment config, using defaults:', error);
      return this.getDefaultEnvironmentConfig();
    }
  }

  async loadFeatureFlags(): Promise<FeatureFlags> {
    try {
      const featureFlagsUrl = '/api/feature-flags';
      const featureFlags = await this.http.get<FeatureFlags>(featureFlagsUrl).toPromise();
      
      this.configService.setFeatureFlags(featureFlags);
      return featureFlags;
      
    } catch (error) {
      console.warn('Failed to load feature flags, using defaults:', error);
      return {};
    }
  }

  validateConfiguration(config: any): boolean {
    if (!config || typeof config !== 'object') {
      return false;
    }
    
    const requiredFields = ['apiBaseUrl', 'environment', 'version'];
    return requiredFields.every(field => field in config);
  }

  mergeConfigurations(configs: AppConfig[]): AppConfig {
    return configs.reduce((merged, config) => {
      return { ...merged, ...config };
    }, {} as AppConfig);
  }

  // Resource Loading Methods
  async preloadResources(): Promise<void> {
    const resources = [
      this.loadCriticalResources(),
      this.loadTranslations(),
      this.loadThemes(),
      this.loadPlugins()
    ];
    
    await Promise.allSettled(resources);
  }

  async loadCriticalResources(): Promise<void> {
    const criticalResources = [
      '/assets/images/logo.svg',
      '/assets/css/critical.css',
      '/assets/js/polyfills.js'
    ];
    
    const loadPromises = criticalResources.map(url => 
      this.loaderService.loadResource(url)
    );
    
    await Promise.allSettled(loadPromises);
  }

  async loadTranslations(): Promise<void> {
    const language = this.detectLanguage();
    const translationUrl = `/assets/i18n/${language}.json`;
    
    try {
      const translations = await this.http.get(translationUrl).toPromise();
      // Set translations in i18n service
    } catch (error) {
      console.warn(`Failed to load translations for ${language}:`, error);
    }
  }

  async loadThemes(): Promise<void> {
    const theme = this.detectTheme();
    const themeUrl = `/assets/themes/${theme}.css`;
    
    try {
      await this.loaderService.loadStylesheet(themeUrl);
    } catch (error) {
      console.warn(`Failed to load theme ${theme}:`, error);
    }
  }

  async loadPlugins(): Promise<void> {
    const config = this.configService.getConfig();
    const plugins = config?.plugins || [];
    
    const loadPromises = plugins.map(plugin => 
      this.loaderService.loadScript(plugin.url)
    );
    
    await Promise.allSettled(loadPromises);
  }

  // Service Registration Methods
  async registerServices(): Promise<void> {
    // Register dynamic services based on configuration
    const config = this.configService.getConfig();
    
    if (config?.analytics?.enabled) {
      await this.registerAnalyticsService();
    }
    
    if (config?.logging?.enableRemoteLogging) {
      await this.registerRemoteLoggingService();
    }
    
    // Register other conditional services
    await this.registerConditionalServices();
  }

  registerProviders(providers: any[]): void {
    // Dynamic provider registration logic
    providers.forEach(provider => {
      // Register provider with Angular injector
    });
  }

  registerInterceptors(): void {
    // Register HTTP interceptors
  }

  registerGuards(): void {
    // Register route guards
  }

  registerResolvers(): void {
    // Register route resolvers
  }

  // Health Check Methods
  async performHealthChecks(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    const checks = await Promise.allSettled([
      this.checkDatabaseConnection(),
      this.checkApiEndpoints(),
      this.checkExternalServices()
    ]);
    
    const healthChecks: HealthCheck[] = [
      {
        name: 'Database Connection',
        status: checks[0].status === 'fulfilled' && checks[0].value ? 'pass' : 'fail',
        message: checks[0].status === 'fulfilled' ? 'Database connection successful' : 'Database connection failed',
        duration: 0
      },
      {
        name: 'API Endpoints',
        status: checks[1].status === 'fulfilled' && checks[1].value ? 'pass' : 'fail',
        message: checks[1].status === 'fulfilled' ? 'API endpoints accessible' : 'API endpoints not accessible',
        duration: 0
      },
      {
        name: 'External Services',
        status: checks[2].status === 'fulfilled' && checks[2].value ? 'pass' : 'fail',
        message: checks[2].status === 'fulfilled' ? 'External services available' : 'External services unavailable',
        duration: 0
      }
    ];
    
    const failedChecks = healthChecks.filter(check => check.status === 'fail').length;
    const warnChecks = healthChecks.filter(check => check.status === 'warn').length;
    
    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (failedChecks === 0 && warnChecks === 0) {
      overall = 'healthy';
    } else if (failedChecks === 0) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }
    
    return {
      overall,
      checks: healthChecks,
      timestamp: Date.now(),
      duration: Date.now() - startTime
    };
  }

  async checkDatabaseConnection(): Promise<boolean> {
    try {
      await this.http.get('/api/health/database').toPromise();
      return true;
    } catch {
      return false;
    }
  }

  async checkApiEndpoints(): Promise<boolean> {
    try {
      await this.http.get('/api/health').toPromise();
      return true;
    } catch {
      return false;
    }
  }

  async checkExternalServices(): Promise<boolean> {
    // Check external service dependencies
    return true;
  }

  getHealthStatus(): HealthStatus {
    return {
      status: 'healthy',
      lastCheck: Date.now(),
      uptime: Date.now() - this._initializationStartTime,
      version: '1.0.0',
      environment: this.detectEnvironment(),
      services: []
    };
  }

  // Error Handling Methods
  handleInitializationError(error: Error): void {
    this._initializationErrors.push(error);
    this._initializationError$.next(error);
    
    if (this._config.enableLogging) {
      console.error('Initialization error:', error);
    }
  }

  async retryInitialization(maxRetries?: number): Promise<boolean> {
    const retries = maxRetries || this._config.maxRetries;
    
    for (let i = 0; i < retries; i++) {
      try {
        await this.delay(this._config.retryDelay * (i + 1));
        return await this.initialize();
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
      }
    }
    
    return false;
  }

  async rollbackInitialization(): Promise<void> {
    // Rollback initialization steps in reverse order
    const completedSteps = this._initializationSteps.filter(step => step.rollback);
    
    for (const step of completedSteps.reverse()) {
      try {
        if (step.rollback) {
          await step.rollback();
        }
      } catch (error) {
        console.error(`Failed to rollback step '${step.name}':`, error);
      }
    }
  }

  getInitializationErrors(): Error[] {
    return [...this._initializationErrors];
  }

  clearInitializationErrors(): void {
    this._initializationErrors = [];
    this._initializationError$.next(null);
  }

  // Utility Methods
  getInitializationTime(): number {
    if (this._initializationEndTime && this._initializationStartTime) {
      return this._initializationEndTime - this._initializationStartTime;
    }
    return 0;
  }

  getInitializationSteps(): InitializationStep[] {
    return [...this._initializationSteps];
  }

  addInitializationStep(step: InitializationStep): void {
    this._initializationSteps.push(step);
    this._initializationSteps.sort((a, b) => a.priority - b.priority);
  }

  removeInitializationStep(stepId: string): void {
    this._initializationSteps = this._initializationSteps.filter(step => step.id !== stepId);
  }

  getInitializationMetrics(): InitializationMetrics {
    const stepTimes: Record<string, number> = {};
    
    // Calculate step times (would need to track during execution)
    this._initializationSteps.forEach(step => {
      stepTimes[step.id] = 0; // Placeholder
    });
    
    return {
      totalTime: this.getInitializationTime(),
      stepTimes,
      memoryUsage: this.getMemoryUsage(),
      resourcesLoaded: 0, // Track during execution
      errorsCount: this._initializationErrors.length,
      retryCount: 0, // Track during execution
      cacheHitRate: 0 // Track during execution
    };
  }

  // Private helper methods
  private updateProgress(message: string, completed: number, total: number, description?: string): void {
    if (!this._config.enableProgressTracking) {
      return;
    }
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const estimatedTimeRemaining = this.calculateEstimatedTime(completed, total);
    
    const progress: InitializationProgress = {
      currentStep: message,
      completedSteps: completed,
      totalSteps: total,
      percentage,
      message: description || message,
      startTime: this._initializationStartTime,
      estimatedTimeRemaining
    };
    
    this._initializationProgress$.next(progress);
  }

  private calculateEstimatedTime(completed: number, total: number): number | undefined {
    if (completed === 0 || !this._initializationStartTime) {
      return undefined;
    }
    
    const elapsed = Date.now() - this._initializationStartTime;
    const averageTimePerStep = elapsed / completed;
    const remainingSteps = total - completed;
    
    return remainingSteps * averageTimePerStep;
  }

  private getOrderedSteps(): InitializationStep[] {
    return [...this._initializationSteps].sort((a, b) => a.priority - b.priority);
  }

  private async executeStepWithRetry(step: InitializationStep): Promise<any> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= step.retryCount; attempt++) {
      try {
        const result = await Promise.race([
          step.execute(),
          this.createTimeoutPromise(step.timeout)
        ]);
        
        if (step.validate && !step.validate(result)) {
          throw new Error(`Step validation failed: ${step.name}`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        if (attempt < step.retryCount) {
          await this.delay(this._config.retryDelay);
        }
      }
    }
    
    throw lastError!;
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Step timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getConfigurationUrl(): string {
    const environment = this.detectEnvironment();
    return `/assets/config/app.${environment}.json`;
  }

  private detectEnvironment(): string {
    if (this.platformService.isBrowser) {
      const hostname = window.location.hostname;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
      } else if (hostname.includes('staging')) {
        return 'staging';
      } else {
        return 'production';
      }
    }
    
    return 'production';
  }

  private detectLanguage(): string {
    if (this.platformService.isBrowser) {
      return navigator.language.split('-')[0] || 'en';
    }
    return 'en';
  }

  private detectTheme(): string {
    if (this.platformService.isBrowser) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'light';
  }

  private async detectPlatform(): Promise<void> {
    // Platform detection logic
    return Promise.resolve();
  }

  private getDefaultEnvironmentConfig(): EnvironmentConfig {
    return {
      name: 'default',
      production: false,
      debug: true,
      apiUrl: '/api',
      cdnUrl: '/assets',
      assetsUrl: '/assets',
      socketUrl: '/socket',
      authUrl: '/auth',
      variables: {}
    };
  }

  private async registerAnalyticsService(): Promise<void> {
    // Register analytics service
  }

  private async registerRemoteLoggingService(): Promise<void> {
    // Register remote logging service
  }

  private async registerConditionalServices(): Promise<void> {
    // Register other conditional services
  }

  private getMemoryUsage(): number {
    if (this.platformService.isBrowser && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}
```

## Cách sử dụng

### Khởi tạo ứng dụng cơ bản

```typescript
import { Component, OnInit } from '@angular/core';
import { AppInitializeService } from '@cci-web/core/services';

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="!isInitialized" class="initialization-screen">
      <div class="progress-container">
        <h2>Initializing Application...</h2>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            [style.width.%]="initializationProgress.percentage">
          </div>
        </div>
        <p>{{ initializationProgress.message }}</p>
        <small>{{ initializationProgress.completedSteps }} / {{ initializationProgress.totalSteps }} steps completed</small>
      </div>
    </div>
    
    <div *ngIf="isInitialized" class="app-content">
      <router-outlet></router-outlet>
    </div>
    
    <div *ngIf="initializationError" class="error-screen">
      <h2>Initialization Failed</h2>
      <p>{{ initializationError.message }}</p>
      <button (click)="retryInitialization()">Retry</button>
    </div>
  `,
  styles: [`
    .initialization-screen {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #f5f5f5;
    }
    
    .progress-container {
      text-align: center;
      max-width: 400px;
      padding: 2rem;
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
    
    .error-screen {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #fff5f5;
      color: #d32f2f;
    }
  `]
})
export class AppComponent implements OnInit {
  isInitialized = false;
  initializationProgress: any = { percentage: 0, message: '', completedSteps: 0, totalSteps: 0 };
  initializationError: Error | null = null;

  constructor(private appInitializeService: AppInitializeService) {}

  ngOnInit(): void {
    // Subscribe to initialization state
    this.appInitializeService.isInitialized$.subscribe(initialized => {
      this.isInitialized = initialized;
    });
    
    this.appInitializeService.initializationProgress$.subscribe(progress => {
      this.initializationProgress = progress;
    });
    
    this.appInitializeService.initializationError$.subscribe(error => {
      this.initializationError = error;
    });
    
    // Start initialization
    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    try {
      await this.appInitializeService.initialize();
      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Application initialization failed:', error);
    }
  }

  retryInitialization(): void {
    this.initializationError = null;
    this.appInitializeService.clearInitializationErrors();
    this.initializeApp();
  }
}
```

### Các bước khởi tạo tùy chỉnh

```typescript
import { Injectable } from '@angular/core';
import { AppInitializeService, InitializationStep } from '@cci-web/core/services';

@Injectable({
  providedIn: 'root'
})
export class CustomInitializationService {
  constructor(private appInitializeService: AppInitializeService) {
    this.setupCustomSteps();
  }

  private setupCustomSteps(): void {
    // Add custom initialization step
    const customStep: InitializationStep = {
      id: 'load-user-preferences',
      name: 'Load User Preferences',
      description: 'Loading user preferences from server',
      priority: 8,
      required: false,
      timeout: 5000,
      retryCount: 2,
      dependencies: ['register-services'],
      execute: () => this.loadUserPreferences(),
      validate: (result) => result && result.preferences,
      rollback: () => this.clearUserPreferences()
    };
    
    this.appInitializeService.addInitializationStep(customStep);
    
    // Add another custom step
    const analyticsStep: InitializationStep = {
      id: 'initialize-analytics',
      name: 'Initialize Analytics',
      description: 'Setting up analytics tracking',
      priority: 9,
      required: false,
      timeout: 3000,
      retryCount: 1,
      dependencies: ['load-configuration'],
      execute: () => this.initializeAnalytics()
    };
    
    this.appInitializeService.addInitializationStep(analyticsStep);
  }

  private async loadUserPreferences(): Promise<any> {
    // Load user preferences from API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ preferences: { theme: 'dark', language: 'en' } });
      }, 1000);
    });
  }

  private async clearUserPreferences(): Promise<void> {
    // Clear user preferences
    console.log('Clearing user preferences');
  }

  private async initializeAnalytics(): Promise<void> {
    // Initialize analytics service
    console.log('Analytics initialized');
  }
}
```

### Service cấu hình nâng cao

```typescript
import { Injectable } from '@angular/core';
import { AppInitializeService } from '@cci-web/core/services';

@Injectable({
  providedIn: 'root'
})
export class AdvancedAppService {
  constructor(private appInitializeService: AppInitializeService) {}

  async initializeWithCustomConfig(): Promise<void> {
    // Configure initialization service
    const customConfig = {
      enableProgressTracking: true,
      enableHealthChecks: true,
      enableRetry: true,
      maxRetries: 5,
      retryDelay: 2000,
      timeout: 60000,
      enableRollback: true,
      enableMetrics: true,
      enableLogging: true,
      criticalStepsOnly: false
    };
    
    // Wait for initialization
    try {
      const initialized = await this.appInitializeService.initialize();
      
      if (initialized) {
        console.log('Application ready!');
        
        // Get initialization metrics
        const metrics = this.appInitializeService.getInitializationMetrics();
        console.log('Initialization metrics:', metrics);
        
        // Get health status
        const healthStatus = this.appInitializeService.getHealthStatus();
        console.log('Health status:', healthStatus);
      }
    } catch (error) {
      console.error('Initialization failed:', error);
      
      // Get initialization errors
      const errors = this.appInitializeService.getInitializationErrors();
      console.error('Initialization errors:', errors);
    }
  }

  monitorInitializationProgress(): void {
    this.appInitializeService.initializationProgress$.subscribe(progress => {
      console.log(`Initialization progress: ${progress.percentage}%`);
      console.log(`Current step: ${progress.currentStep}`);
      console.log(`Steps completed: ${progress.completedSteps}/${progress.totalSteps}`);
      
      if (progress.estimatedTimeRemaining) {
        console.log(`Estimated time remaining: ${progress.estimatedTimeRemaining}ms`);
      }
    });
  }

  async performHealthCheck(): Promise<void> {
    const healthResult = await this.appInitializeService.performHealthChecks();
    
    console.log('Health check result:', healthResult);
    
    if (healthResult.overall === 'unhealthy') {
      console.error('System is unhealthy!');
      // Handle unhealthy state
    } else if (healthResult.overall === 'degraded') {
      console.warn('System is degraded');
      // Handle degraded state
    } else {
      console.log('System is healthy');
    }
  }
}
```

## Thực hành tốt nhất

### 1. Thiết kế bước khởi tạo

```typescript
// ✅ Good: Well-structured initialization step
const goodStep: InitializationStep = {
  id: 'load-critical-data',
  name: 'Load Critical Data',
  description: 'Loading essential application data',
  priority: 5,
  required: true,
  timeout: 10000,
  retryCount: 2,
  dependencies: ['load-configuration'],
  execute: async () => {
    const data = await this.dataService.loadCriticalData();
    return data;
  },
  validate: (result) => result && result.length > 0,
  rollback: async () => {
    await this.dataService.clearCriticalData();
  }
};

// ❌ Bad: Poorly structured step
const badStep: InitializationStep = {
  id: 'step1',
  name: 'Step',
  description: '',
  priority: 0,
  required: true,
  timeout: 0,
  retryCount: 0,
  dependencies: [],
  execute: () => {
    // No error handling, no return value
    console.log('doing something');
  }
};
```

### 2. Chiến lược xử lý lỗi

```typescript
// ✅ Good: Comprehensive error handling
class GoodInitializationService {
  async initialize(): Promise<void> {
    try {
      await this.appInitializeService.initialize();
    } catch (error) {
      // Log error details
      console.error('Initialization failed:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Get detailed error information
      const errors = this.appInitializeService.getInitializationErrors();
      const status = this.appInitializeService.getInitializationStatus();
      
      // Decide on recovery strategy
      if (this.canRecoverFromError(error)) {
        await this.attemptRecovery();
      } else {
        this.showErrorToUser(error);
      }
    }
  }

  private canRecoverFromError(error: Error): boolean {
    // Determine if error is recoverable
    return !error.message.includes('critical');
  }

  private async attemptRecovery(): Promise<void> {
    // Attempt to recover from error
    await this.appInitializeService.retryInitialization(3);
  }

  private showErrorToUser(error: Error): void {
    // Show user-friendly error message
  }
}
```

### 3. Theo dõi tiến trình

```typescript
// ✅ Good: Detailed progress tracking
class ProgressTrackingService {
  constructor(private appInitializeService: AppInitializeService) {
    this.setupProgressTracking();
  }

  private setupProgressTracking(): void {
    this.appInitializeService.initializationProgress$.subscribe(progress => {
      // Update UI with progress
      this.updateProgressBar(progress.percentage);
      this.updateStatusMessage(progress.message);
      
      // Log progress for debugging
      if (progress.percentage % 10 === 0) {
        console.log(`Initialization ${progress.percentage}% complete`);
      }
      
      // Estimate completion time
      if (progress.estimatedTimeRemaining) {
        this.updateTimeRemaining(progress.estimatedTimeRemaining);
      }
    });
  }

  private updateProgressBar(percentage: number): void {
    // Update progress bar UI
  }

  private updateStatusMessage(message: string): void {
    // Update status message UI
  }

  private updateTimeRemaining(timeMs: number): void {
    // Update time remaining UI
  }
}
```

### 4. Quản lý cấu hình

```typescript
// ✅ Good: Structured configuration loading
class ConfigurationService {
  async loadApplicationConfig(): Promise<AppConfig> {
    try {
      // Load base configuration
      const baseConfig = await this.loadBaseConfig();
      
      // Load environment-specific configuration
      const envConfig = await this.loadEnvironmentConfig();
      
      // Load feature flags
      const featureFlags = await this.loadFeatureFlags();
      
      // Merge configurations
      const mergedConfig = this.appInitializeService.mergeConfigurations([
        baseConfig,
        envConfig,
        { features: featureFlags }
      ]);
      
      // Validate final configuration
      if (!this.appInitializeService.validateConfiguration(mergedConfig)) {
        throw new Error('Invalid merged configuration');
      }
      
      return mergedConfig;
      
    } catch (error) {
      console.error('Failed to load configuration:', error);
      throw error;
    }
  }

  private async loadBaseConfig(): Promise<AppConfig> {
    // Load base configuration
    return this.http.get<AppConfig>('/assets/config/app.json').toPromise();
  }

  private async loadEnvironmentConfig(): Promise<Partial<AppConfig>> {
    // Load environment-specific overrides
    const env = this.detectEnvironment();
    return this.http.get<Partial<AppConfig>>(`/assets/config/app.${env}.json`).toPromise();
  }

  private async loadFeatureFlags(): Promise<FeatureFlags> {
    // Load feature flags from API or config
    return this.http.get<FeatureFlags>('/api/feature-flags').toPromise();
  }

  private detectEnvironment(): string {
    // Detect current environment
    return window.location.hostname.includes('localhost') ? 'development' : 'production';
  }
}
```

## Cân nhắc về hiệu suất

### 1. Tối ưu hóa khởi tạo
- Prioritize critical steps và load non-critical resources sau
- Sử dụng parallel loading cho independent resources
- Implement timeout và retry logic hợp lý
- Cache configuration để tránh repeated requests

### 2. Quản lý bộ nhớ
- Clean up resources trong rollback methods
- Unsubscribe từ observables khi không cần
- Limit số lượng initialization steps
- Monitor memory usage during initialization

### 3. Tối ưu hóa mạng
- Bundle configuration files khi có thể
- Use compression cho large configuration files
- Implement caching headers cho static resources
- Minimize số lượng HTTP requests

## Khắc phục sự cố

### Các vấn đề thường gặp

**1. Timeout khởi tạo**
```typescript
// Increase timeout for slow networks
const config = {
  timeout: 60000, // 60 seconds
  maxRetries: 5,
  retryDelay: 3000
};
```

**2. Lỗi tải cấu hình**
```typescript
// Implement fallback configuration
try {
  const config = await this.loadConfiguration();
} catch (error) {
  console.warn('Using fallback configuration:', error);
  const fallbackConfig = this.getFallbackConfiguration();
  this.configService.setConfig(fallbackConfig);
}
```

**3. Vấn đề phân giải phụ thuộc**
```typescript
// Check step dependencies
const steps = this.appInitializeService.getInitializationSteps();
const dependencyIssues = this.validateStepDependencies(steps);
if (dependencyIssues.length > 0) {
  console.error('Dependency issues found:', dependencyIssues);
}
```

## Phụ thuộc

- `@angular/core`: Angular framework
- `@angular/common/http`: HTTP client
- `rxjs`: Reactive programming
- `ConfigService`: Configuration management
- `PlatformService`: Platform detection
- `LoaderService`: Resource loading

## Các Service liên quan

- **ConfigService**: Configuration management
- **LoaderService**: Resource loading
- **PlatformService**: Platform detection
- **HealthCheckService**: System health monitoring
- **LoggingService**: Application logging
- **AnalyticsService**: Usage analytics