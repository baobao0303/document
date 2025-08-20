# Cài đặt Provider

Hướng dẫn này sẽ giúp bạn thiết lập providers cho cả hai module `@cci-web/core` và `@cci-web/shared` trong ứng dụng Angular của bạn sử dụng phương pháp standalone hiện đại với `ApplicationConfig`.

## Tổng quan

Providers là các thành phần thiết yếu để cấu hình và khởi tạo các services, interceptors và các dependencies khác được yêu cầu bởi thư viện CCI Web. Hướng dẫn này trình bày cách thiết lập hoàn chỉnh sử dụng cấu hình thực tế từ ứng dụng production.

## Required Constants and Configuration

Trước khi thiết lập providers, bạn cần định nghĩa các hằng số ứng dụng:

```typescript
// config/app-config.ts
export const APP_NAME = 'Your App Name';
export const DEFAULT_CACHE_TIME = 300000; // 5 minutes
export const MAX_CACHE_SIZE = 100;

// config/constants.ts
export const PAGE_SIZE = 20;
export const MESSAGE = {
  GET_VALIDATE_FORM: 'Please fill in all required fields',
  NO_DATA: 'No data available',
  ADD_TO_CART_ERROR: 'Failed to add item to cart'
};
export const INVALID_MESSAGE = {
  EMAIL: 'Please enter a valid email address',
  NUMBER: 'Please enter a valid number',
  POSITIVE_NUMBER: 'Please enter a positive number',
  POSITIVE_INTERGER: 'Please enter a positive integer'
};
export const OTP_TIMER = 60;
export const PHONE_REGEX = /^[0-9]{10,11}$/;
export const DEFAULT_PLACEHOlDER_INPUT_SEARCH = 'Search...';
export const SPECIAL_CHAR_PATTERN_SEARCH = /[!@#$%^&*(),.?":{}|<>]/g;
export const VIEWED_ALL_CONTENT = 'You have viewed all content';

// config/gateway-api.constants.ts
export const GATEWAY_API = {
  SE_API: 'https://api.example.com/se',
  SE_IMAGE_API: 'https://images.example.com',
  API: 'https://api.example.com'
};
```

## Thiết lập Provider cho Core Module

### 1. Import các Module cần thiết

```typescript
import { 
  ApplicationConfig, 
  importProvidersFrom, 
  inject, 
  provideAppInitializer, 
  provideExperimentalZonelessChangeDetection 
} from "@angular/core";
import { provideHttpClient, withNoXsrfProtection } from "@angular/common/http";
import { BrowserAnimationsModule, provideAnimations } from "@angular/platform-browser/animations";
import { 
  provideCciWebCore, 
  getBaseProviders, 
  initializeAppConfig,
  AppInitializeService,
  OverlayService,
  LoadingSpinnerService,
  BreakpointService
} from "@cci-web/core";
import { 
  SHARED_ENVIRONMENT,
  OVERLAY_PORT,
  LOADING_SPINNER_PORT,
  BREAKPOINT_PORT
} from "@cci-web/shared";
```

### 2. Thiết lập Core Provider với cấu hình thực tế

```typescript
// Shared CCI Web Core Configuration
export const sharedWebCoreConfig = {
  appName: APP_NAME,
  defaultCacheTime: DEFAULT_CACHE_TIME,
  maxCacheSize: MAX_CACHE_SIZE,
  pageSize: PAGE_SIZE,
  gatewayApi: {
    seApi: GATEWAY_API.SE_API,
    seImageApi: GATEWAY_API.SE_IMAGE_API,
    api: GATEWAY_API.API
  },
  messages: {
    getValidateForm: MESSAGE.GET_VALIDATE_FORM,
    noData: MESSAGE.NO_DATA,
    addToCartError: MESSAGE.ADD_TO_CART_ERROR
  },
  invalidMessages: {
    email: INVALID_MESSAGE.EMAIL,
    number: INVALID_MESSAGE.NUMBER,
    positiveNumber: INVALID_MESSAGE.POSITIVE_NUMBER,
    positiveInteger: INVALID_MESSAGE.POSITIVE_INTERGER
  },
  otpTimer: OTP_TIMER,
  phoneRegex: PHONE_REGEX,
  defaultPlaceholderInputSearch: DEFAULT_PLACEHOlDER_INPUT_SEARCH,
  specialCharPatternSearch: SPECIAL_CHAR_PATTERN_SEARCH,
  viewedAllContent: VIEWED_ALL_CONTENT
};

// Shared Core Providers
export const getSharedCoreProviders = () => [
  ...provideCciWebCore({
    environment,
    appName: APP_NAME,
    appConfig: sharedWebCoreConfig
  })
];
```

### 3. Shared Environment Configuration

```typescript
// Shared Environment Configuration
const sharedEnvironment = {
  production: environment.production,
  cdnUrl: environment.cdnUrl,
  apiUrl: environment.siteUrl // Sử dụng siteUrl làm apiUrl
};

// Base Providers
export const baseProviders = [
  { provide: APP_BASE_HREF, useFactory: getBaseUrl },
  { provide: "CONFIG_APP", useFactory: getConfigApp },
  ...getBaseProviders(),
  initializeAppConfig.providers
];
```

## Thiết lập Provider cho Shared Module

### 1. Cấu hình Common Providers

```typescript
// Common Providers
export const commonProviders = [
  provideExperimentalZonelessChangeDetection(),
  provideHttpClient(withNoXsrfProtection()),
  importProvidersFrom(BrowserAnimationsModule),
  provideAnimations(),
  { provide: OVERLAY_PORT, useExisting: OverlayService },
  { provide: LOADING_SPINNER_PORT, useExisting: LoadingSpinnerService },
  { provide: BREAKPOINT_PORT, useExisting: BreakpointService },
  { provide: SHARED_ENVIRONMENT, useValue: sharedEnvironment },
  ...getSharedCoreProviders(),
  provideAppInitializer(() => {
    const initializerFn = initializeApplication(inject(AppInitializeService));
    return initializerFn();
  })
];
```

### 2. Thiết lập cấu hình ứng dụng

```typescript
// Initialize Application function
export const initializeApplication = (
  appInitialize: AppInitializeService
): (() => Observable<boolean>) => {
  appInitialize.setInitialize(true);
  return () => of(true);
};

// Base URL and Config App functions
export const getBaseUrl = () => {
  if (typeof document !== "undefined") {
    const baseTags = document.getElementsByTagName("base");
    return baseTags.length ? baseTags[0].href.slice(0, -1) : "/";
  }
  return "/";
};

const getConfigApp = () => {
  if (typeof window !== "undefined") {
    return (window as any).__CONFIG_APP__ || {};
  }
  return {};
};
```

### 3. Complete Application Configuration

```typescript
const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: "disabled",
  anchorScrolling: "enabled"
};

export const appConfig: ApplicationConfig = {
  providers: [
    ...commonProviders,
    provideRouter(
      ROUTES,
      withPreloading(FlagBasedPreloadingStrategy),
      withInMemoryScrolling(scrollConfig)
    ),
    ...baseProviders
  ]
};
```

## Cấu hình nâng cao

### Custom Service Providers

```typescript
import { Injectable } from '@angular/core';
import { CciConfigService } from '@cci-web/core';

@Injectable()
export class CustomConfigService extends CciConfigService {
  override getApiEndpoint(endpoint: string): string {
    // Custom logic for API endpoint resolution
    return `${this.baseUrl}/v2/${endpoint}`;
  }
}

@NgModule({
  providers: [
    { provide: CciConfigService, useClass: CustomConfigService }
  ]
})
```

### Cấu hình HTTP Interceptor

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor, LoggingInterceptor } from '@cci-web/core';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptor,
      multi: true
    }
  ]
})
```

## Thiết lập Feature Module

### Lazy-Loaded Modules

```typescript
// feature.module.ts
import { NgModule } from '@angular/core';
import { CciCoreModule, CciSharedModule } from '@cci-web/core';

@NgModule({
  imports: [
    CciCoreModule.forChild(), // Use forChild() in feature modules
    CciSharedModule.forChild()
  ]
})
export class FeatureModule { }
```

### Standalone Components

```typescript
import { Component } from '@angular/core';
import { CciButtonComponent, CciTableComponent } from '@cci-web/shared';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CciButtonComponent, CciTableComponent],
  template: `
    <cci-button>Click me</cci-button>
    <cci-table [data]="tableData"></cci-table>
  `
})
export class ExampleComponent { }
```

## Testing Configuration

### Unit Tests

```typescript
import { TestBed } from '@angular/core/testing';
import { CciCoreModule, CciSharedModule } from '@cci-web/core';

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [
      CciCoreModule.forRoot({
        apiUrl: 'http://localhost:3000/api',
        enableLogging: false
      }),
      CciSharedModule.forRoot({
        theme: 'test'
      })
    ]
  });
});
```

### Mock Providers

```typescript
import { CciApiService } from '@cci-web/core';

const mockApiService = {
  get: jasmine.createSpy('get').and.returnValue(of({})),
  post: jasmine.createSpy('post').and.returnValue(of({}))
};

TestBed.configureTestingModule({
  providers: [
    { provide: CciApiService, useValue: mockApiService }
  ]
});
```

## Khắc phục sự cố

### Các vấn đề thường gặp

1. **Thứ tự Import Module**: Đảm bảo `CciCoreModule.forRoot()` được import trước các CCI modules khác
2. **Nhiều lần gọi forRoot()**: Chỉ gọi `forRoot()` một lần trong root module của bạn
3. **Thiếu Dependencies**: Xác minh tất cả peer dependencies đã được cài đặt
4. **Xung đột cấu hình**: Kiểm tra các cấu hình provider có xung đột

### Chế độ Debug

```typescript
CciCoreModule.forRoot({
  enableLogging: true,
  logLevel: 'debug'
})
```

## Các bước tiếp theo

- [Core Module Configuration](/version/v0.0.1/core/config/introduction)
- [Shared Components](/version/v0.0.1/shared/components)
- [API Services](/version/v0.0.1/core/config/services)
- [Custom Providers](/version/v0.0.1/core/config/providers)

## Hỗ trợ

Nếu bạn gặp vấn đề với việc thiết lập provider:

- Kiểm tra [FAQ](/faq) để tìm các giải pháp thường gặp
- Xem lại [Hướng dẫn khắc phục sự cố](/troubleshooting)
- Liên hệ [Hỗ trợ cộng đồng](/community)