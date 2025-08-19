# Provider Setup

This guide will walk you through setting up providers for both `@cci-web/core` and `@cci-web/shared` modules in your Angular application using the modern standalone approach with `ApplicationConfig`.

## Overview

Providers are essential components that configure and initialize services, interceptors, and other dependencies required by the CCI Web libraries. This guide shows the complete setup using real-world configuration from a production application.

## Required Constants and Configuration

Before setting up providers, you need to define your application constants:

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

## Core Module Provider Setup

### 1. Import Required Modules

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

### 2. Core Provider Setup with Real Configuration

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

## Shared Module Provider Setup

### 1. Common Providers Configuration

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

### 2. Application Configuration Setup

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

## Advanced Configuration

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

### HTTP Interceptor Configuration

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

## Feature Module Setup

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

## Troubleshooting

### Common Issues

1. **Module Import Order**: Ensure `CciCoreModule.forRoot()` is imported before other CCI modules
2. **Multiple forRoot() Calls**: Only call `forRoot()` once in your root module
3. **Missing Dependencies**: Verify all peer dependencies are installed
4. **Configuration Conflicts**: Check for conflicting provider configurations

### Debug Mode

```typescript
CciCoreModule.forRoot({
  enableLogging: true,
  logLevel: 'debug'
})
```

## Next Steps

- [Core Module Configuration](/version/v0.0.1/core/config/introduction)
- [Shared Components](/version/v0.0.1/shared/components)
- [API Services](/version/v0.0.1/core/config/services)
- [Custom Providers](/version/v0.0.1/core/config/providers)

## Support

If you encounter issues with provider setup:

- Check the [FAQ](/faq) for common solutions
- Review the [Troubleshooting Guide](/troubleshooting)
- Contact [Community Support](/community)