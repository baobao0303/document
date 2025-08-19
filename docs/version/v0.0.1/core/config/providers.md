# Providers Module - @cci-web/core

Module này chứa các provider cấu hình và khởi tạo cho thư viện CCI-Web Core. Các provider này giúp thiết lập dependency injection, cấu hình ứng dụng và quản lý các service cần thiết.

## 📋 Danh sách Providers

| STT | Provider             | File                    | Mô tả                                           |
| --- | -------------------- | ----------------------- | ----------------------------------------------- |
| 1   | App Provider         | app.provider.ts         | Provider chính để cấu hình toàn bộ thư viện     |
| 2   | App Config Provider  | app-config.provider.ts  | Injection token cho tên ứng dụng                |
| 3   | Base Provider        | base.provider.ts        | Provider cơ bản cho APP_BASE_HREF và CONFIG_APP |
| 4   | Config Provider      | config.provider.ts      | Factory functions để tạo và quản lý config      |
| 5   | Core Config Provider | core-config.provider.ts | Định nghĩa cấu trúc config chính và defaults    |
| 6   | Environment Provider | environment.provider.ts | Provider cho environment configuration          |
| 7   | Initializer Provider | initializer.provider.ts | Provider cho app initialization                 |
| 8   | Translate Provider   | translate.provider.ts   | Provider cho internationalization (i18n)        |
| 9   | Config Mapper Utils  | config-mapper.utils.ts  | Utility functions cho config mapping            |
| 10  | Types                | types.ts                | Centralized type definitions và interfaces      |

### 1. App Provider (`app.provider.ts`)

**Mô tả**: Provider chính để cấu hình toàn bộ thư viện CCI-Web Core.

**Interface**:

```typescript
export interface IProvideCciWebCoreOptions {
  /** Environment configuration object */
  environment: IEnvironment;
  /** Application name identifier */
  appName: string;
  /** Partial application configuration to merge with defaults */
  appConfig: Partial<IAppConfig>;
}

export function provideCciWebCore(options: IProvideCciWebCoreOptions): Provider[];
```

**Chức năng**:

- Tổng hợp tất cả provider cần thiết cho CCI Web Core
- Cấu hình ENVIRONMENT injection token
- Thiết lập APP_NAME injection token
- Khởi tạo APP_CONFIG với merge defaults
- Validation các options đầu vào

**Cách sử dụng**:

```typescript
import { provideCciWebCore } from "@cci-web/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";

// Cấu hình cơ bản
const coreOptions = {
  environment: {
    production: false,
    author: "CCI Team",
    siteUrl: "https://ccistore.com",
    imageUrl: "https://images.ccistore.com",
    cdnUrl: "https://cdn.ccistore.com",
  },
  appName: "CCI-Store",
  appConfig: {
    pageSize: 20,
    defaultCacheTime: 300000, // 5 phút
    gatewayApi: {
      ecomApi: "https://api.ccistore.com/v1",
      ecomV4Api: "https://api.ccistore.com/v4",
    },
  },
};

bootstrapApplication(AppComponent, {
  providers: [
    provideWebCore(coreOptions),
    // ... other providers
  ],
});
```

**Ưu điểm**:

- ✅ Cấu hình tập trung, dễ quản lý
- ✅ Type-safe với TypeScript
- ✅ Hỗ trợ partial configuration
- ✅ Tự động merge với default config

**Nhược điểm**:

- ❌ Cần cấu hình đầy đủ các options
- ❌ Không hỗ trợ dynamic configuration

### 2. Core Config Provider (`core-config.provider.ts`)

**Mô tả**: Định nghĩa cấu trúc config chính và default values.

**Interface**:

```typescript
export interface IAppConfig {
  /** Application name identifier */
  appName: string;
  /** Default cache time in milliseconds */
  defaultCacheTime: number;
  /** Maximum number of items to cache */
  maxCacheSize: number;
  /** Default page size for pagination */
  pageSize: number;
  /**
   * Gateway API endpoint configurations
   * Completely dynamic - supports any API endpoint without predefined fields
   * Common endpoints: ecomApi, ecomV4Api, seImageApi, api, seApi
   */
  gatewayApi: Record<string, string>;
  /** User-facing messages configuration */
  messages: {
    getValidateForm: string;
    noData: string;
    addToCartError: string;
  };
  /** Invalid input messages configuration */
  invalidMessages: {
    email: string;
    number: string;
    positiveNumber: string;
    positiveInteger: string;
  };
  /** OTP timer duration in seconds */
  otpTimer: number;
  /** Phone number validation regex pattern */
  phoneRegex: RegExp;
  /** Default placeholder text for search inputs */
  defaultPlaceholderInputSearch: string;
  /** Special character pattern for search validation */
  specialCharPatternSearch: RegExp;
  /** Message when all content has been viewed */
  viewedAllContent: string;
}

export const APP_CONFIG = new InjectionToken<IAppConfig>("APP_CONFIG");
export const DEFAULT_APP_CONFIG: IAppConfig;
```

**Cách sử dụng**:

```typescript
import { inject, Injectable } from "@angular/core";
import { APP_CONFIG, IAppConfig } from "@cci-web/core";

@Injectable()
export class ProductService {
  private config = inject(APP_CONFIG);

  getProducts(page: number = 1) {
    const pageSize = this.config.pageSize;
    const apiUrl = this.config.gatewayApi.ecomApi;

    return this.http.get(`${apiUrl}/products`, {
      params: { page: page.toString(), size: pageSize.toString() },
    });
  }

  validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : this.config.invalidMessages.email;
  }
}
```

**Default Configuration**:

```typescript
const DEFAULT_APP_CONFIG: IAppConfig = {
  appName: "default",
  defaultCacheTime: 300000, // 5 phút
  maxCacheSize: 100,
  pageSize: 10,
  gatewayApi: {
    ecomApi: "",
    ecomV4Api: "",
  },
  messages: {
    getValidateForm: "Vui lòng nhập đủ các thông tin bắt buộc (*)",
    noData: "Không có dữ liệu",
    addToCartError: "Thêm sản phẩm KHÔNG thành công.",
  },
  invalidMessages: {
    email: "Vui lòng nhập nhập email",
    number: "Vui lòng nhập nhập số",
    positiveNumber: "Vui lòng nhập số dương",
    positiveInteger: "Vui lòng nhập số nguyên dương",
  },
  otpTimer: 60,
  phoneRegex: /^(0[3|5|7|8|9][0-9]{8}|0[1-9][0-9]{9})$/,
  defaultPlaceholderInputSearch: "Ba mẹ muốn tìm mua gì hôm nay?",
  specialCharPatternSearch: /[!@#$%\^&\*\(\),\.\?":\{\}\|<>]/g,
  viewedAllContent: "Ba / mẹ đã xem hết nội dung rồi",
};
```

### 3. Config Provider (`config.provider.ts`)

**Mô tả**: Factory functions để tạo và quản lý config providers với type safety và validation.

**Functions**:

```typescript
export function provideCciWebCoreConfig(config: Partial<IAppConfig>): Provider;
export function createCciWebCoreConfigFromAppConfig(legacyConfig: ILegacyAppConfig): IAppConfig;
export function provideCciWebCoreConfigFromLegacy(legacyConfig: ILegacyAppConfig): Provider;
export function provideCciWebCoreConfigFactory(configFactory: () => Partial<IAppConfig> | ILegacyAppConfig): Provider;
export function validateAppConfig(config: Partial<IAppConfig>): boolean;
```

**Cách sử dụng**:

```typescript
import { provideCciWebCoreConfig, createCciWebCoreConfigFromAppConfig } from "@cci-web/core";

// Cách 1: Sử dụng trực tiếp
const customConfig = {
  pageSize: 25,
  defaultCacheTime: 600000, // 10 phút
  messages: {
    noData: "Không tìm thấy dữ liệu nào",
  },
};

const configProvider = provideCciWebCoreConfig(customConfig);

// Cách 2: Convert từ app config hiện tại
const existingAppConfig = {
  APP_NAME: "My Store",
  PAGE_SIZE: 30,
  ECOM_API: "https://api.mystore.com",
  NO_DATA: "No data found",
};

const convertedConfig = createCciWebCoreConfigFromAppConfig(existingAppConfig);
const provider = provideCciWebCoreConfig(convertedConfig);
```

**Ưu điểm**:

- ✅ Hỗ trợ migration từ config cũ
- ✅ Flexible configuration
- ✅ Type-safe merging

### 4. Environment Provider (`environment.provider.ts`)

**Mô tả**: Provider cho environment configuration với type-safe interface.

**Interface**:

```typescript
export interface IEnvironment {
  /** Whether the application is running in production mode */
  production: boolean;
  /** Application author or organization name */
  author: string;
  /** Base site URL */
  siteUrl: string;
  /** Base URL for images */
  imageUrl: string;
  /** CDN base URL for static assets */
  cdnUrl: string;
}

export const ENVIRONMENT = new InjectionToken<IEnvironment>("ENVIRONMENT");
```

**Cách sử dụng**:

```typescript
import { inject, Injectable } from "@angular/core";
import { ENVIRONMENT, IEnvironment } from "@cci-web/core";

@Injectable()
export class ImageService {
  private env = inject(ENVIRONMENT);

  getImageUrl(imagePath: string): string {
    const baseUrl = this.env.production ? this.env.cdnUrl : this.env.imageUrl;
    return `${baseUrl}/${imagePath}`;
  }

  getApiUrl(endpoint: string): string {
    return `${this.env.siteUrl}/api/${endpoint}`;
  }
}

// Component sử dụng
@Component({
  selector: "app-product-image",
  template: ` <img [src]="getImageUrl(product.image)" [alt]="product.name" class="product-image" /> `,
})
export class ProductImageComponent {
  @Input() product: any;

  constructor(private imageService: ImageService) {}

  getImageUrl(imagePath: string): string {
    return this.imageService.getImageUrl(imagePath);
  }
}
```

### 5. Base Provider (`base.provider.ts`)

**Mô tả**: Provider cơ bản cho APP_BASE_HREF và CONFIG_APP.

**Functions**:

```typescript
function getBaseUrl(): string;
function getConfigApp(): Record<string, unknown>;
export function getBaseProviders(): Provider[];
```

**Cách sử dụng**:

```typescript
import { getBaseProviders } from "@cci-web/core";
import { bootstrapApplication } from "@angular/platform-browser";

bootstrapApplication(AppComponent, {
  providers: [
    ...getBaseProviders(),
    // ... other providers
  ],
});

// Sử dụng trong service
@Injectable()
export class UrlService {
  constructor(@Inject(APP_BASE_HREF) private baseHref: string) {}

  getAbsoluteUrl(relativePath: string): string {
    return `${this.baseHref}${relativePath}`;
  }
}
```

**Chức năng**:

- Tự động detect base URL từ `<base>` tag
- Lấy config từ `window.__CONFIG_APP__`
- Hỗ trợ SSR (server-side rendering)

### 6. App Config Provider (`app-config.provider.ts`)

**Mô tả**: Simple injection token cho app name.

```typescript
export const APP_NAME = new InjectionToken<string>("APP_NAME");
```

**Cách sử dụng**:

```typescript
import { inject, Injectable } from "@angular/core";
import { APP_NAME } from "@cci-web/core";

@Injectable()
export class AppService {
  private appName = inject(APP_NAME);

  getAppTitle(): string {
    return `Welcome to ${this.appName}`;
  }
}
```

### 7. Initializer Provider (`initializer.provider.ts`)

**Mô tả**: Provider cho app initialization.

**Functions**:

```typescript
export const initializeApplication: (appInitialize: AppInitializeService) => () => Observable<boolean>;
export const initializeAppConfig: ApplicationConfig;
```

**Cách sử dụng**:

```typescript
import { initializeAppConfig } from "@cci-web/core";
import { mergeApplicationConfig } from "@angular/core";

const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
  ],
};

// Merge với initializer config
const finalConfig = mergeApplicationConfig(appConfig, initializeAppConfig);

bootstrapApplication(AppComponent, finalConfig);
```

### 8. Translate Provider (`translate.provider.ts`)

**Mô tả**: Provider cho internationalization (i18n) sử dụng ngx-translate với hỗ trợ HTTP và Static loader.

**Interfaces & Types**:

```typescript
export interface ITranslateHttpOptions {
  /** Path prefix for translation files (default: "/assets/i18n/") */
  prefix?: string;
  /** File suffix for translation files (default: ".json") */
  suffix?: string;
}

export type TranslationResources = Record<string, Record<string, any>>;

export class StaticTranslateLoader implements TranslateLoader {
  constructor(private readonly resources: TranslationResources);
  public getTranslation(lang: string): Observable<Record<string, any>>;
}
```

**Functions**:

```typescript
export function getTranslateHttpModule(options?: ITranslateHttpOptions): ModuleWithProviders<TranslateModule>;
export function getTranslateStaticModule(resources: TranslationResources): ModuleWithProviders<TranslateModule>;
```

**Cách sử dụng**:

**1. HTTP-based translation (Browser)**:

```typescript
import { getTranslateHttpModule } from "@cci-web/core";

@NgModule({
  imports: [
    getTranslateHttpModule({
      prefix: "/assets/i18n/",
      suffix: ".json",
    }),
  ],
})
export class AppModule {}

// Hoặc với standalone components
import { importProvidersFrom } from "@angular/core";

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      getTranslateHttpModule({
        prefix: "/assets/i18n/",
        suffix: ".json",
      })
    ),
  ],
});
```

**2. Static translation (SSR)**:

```typescript
import { getTranslateStaticModule } from "@cci-web/core";

const translations = {
  vi: {
    HELLO: "Xin chào",
    WELCOME: "Chào mừng bạn đến với {{appName}}",
  },
  en: {
    HELLO: "Hello",
    WELCOME: "Welcome to {{appName}}",
  },
};

@NgModule({
  imports: [getTranslateStaticModule(translations)],
})
export class AppServerModule {}
```

**3. Sử dụng trong component**:

```typescript
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-welcome",
  template: `
    <h1>{{ "HELLO" | translate }}</h1>
    <p>{{ "WELCOME" | translate : { appName: appName } }}</p>
    <button (click)="switchLanguage('vi')">Tiếng Việt</button>
    <button (click)="switchLanguage('en')">English</button>
  `,
})
export class WelcomeComponent {
  appName = "CCI Store";

  constructor(private translate: TranslateService) {
    translate.setDefaultLang("vi");
    translate.use("vi");
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }
}
```

## 🔧 Hướng dẫn cấu hình chi tiết

### Cấu hình cơ bản

```typescript
// main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideCciWebCore, getBaseProviders } from "@cci-web/core";
import { AppComponent } from "./app/app.component";

const environment = {
  production: false,
  author: "CCI Team",
  siteUrl: "http://localhost:4200",
  imageUrl: "http://localhost:4200/assets/images",
  cdnUrl: "https://cdn.ccistore.com",
};

const appConfig = {
  pageSize: 20,
  defaultCacheTime: 300000,
  gatewayApi: {
    ecomApi: "http://localhost:5000/api/v1",
    ecomV4Api: "http://localhost:5000/api/v4",
  },
  messages: {
    noData: "Không có dữ liệu để hiển thị",
  },
};

bootstrapApplication(AppComponent, {
  providers: [
    ...getBaseProviders(),
    provideCciWebCore({
      environment,
      appName: "CCI Store Development",
      appConfig,
    }),
  ],
});
```

### Cấu hình cho Production

```typescript
// main.prod.ts
const productionEnvironment = {
  production: true,
  author: "CCI Team",
  siteUrl: "https://ccistore.com",
  imageUrl: "https://images.ccistore.com",
  cdnUrl: "https://cdn.ccistore.com",
};

const productionConfig = {
  pageSize: 50,
  defaultCacheTime: 600000, // 10 phút
  maxCacheSize: 500,
  gatewayApi: {
    ecomApi: "https://api.ccistore.com/v1",
    ecomV4Api: "https://api.ccistore.com/v4",
  },
};

bootstrapApplication(AppComponent, {
  providers: [
    ...getBaseProviders(),
    provideCciWebCore({
      environment: productionEnvironment,
      appName: "CCI Store",
      appConfig: productionConfig,
    }),
  ],
});
```

### Cấu hình với Translation

```typescript
import { importProvidersFrom } from "@angular/core";
import { getTranslateHttpModule } from "@cci-web/core";

bootstrapApplication(AppComponent, {
  providers: [
    ...getBaseProviders(),
    provideCciWebCore({
      environment,
      appName: "CCI Store",
      appConfig,
    }),
    importProvidersFrom(
      getTranslateHttpModule({
        prefix: "/assets/i18n/",
        suffix: ".json",
      })
    ),
  ],
});
```

## 🚨 Các lỗi thường gặp và cách khắc phục

### 1. Lỗi "No provider for APP_CONFIG"

**Nguyên nhân**: Chưa cấu hình provideCciWebCore hoặc thiếu appConfig

**Giải pháp**:

```typescript
// ❌ Sai - thiếu appConfig
provideCciWebCore({
  environment,
  appName: "My App",
  // thiếu appConfig
});

// ✅ Đúng
provideCciWebCore({
  environment,
  appName: "My App",
  appConfig: {}, // ít nhất là object rỗng
});
```

### 2. Lỗi "Cannot read property 'ecomApi' of undefined"

**Nguyên nhân**: Cấu hình gatewayApi không đầy đủ

**Giải pháp**:

```typescript
// ❌ Sai
appConfig: {
  gatewayApi: {
    ecomApi: 'https://api.example.com'
    // thiếu ecomV4Api
  }
}

// ✅ Đúng
appConfig: {
  gatewayApi: {
    ecomApi: 'https://api.example.com/v1',
    ecomV4Api: 'https://api.example.com/v4'
  }
}
```

### 3. Lỗi Translation không load

**Nguyên nhân**: File translation không tồn tại hoặc đường dẫn sai

**Giải pháp**:

```typescript
// Kiểm tra file tồn tại:
// src/assets/i18n/vi.json
// src/assets/i18n/en.json

// Cấu hình đúng đường dẫn
getTranslateHttpModule({
  prefix: "/assets/i18n/", // Chú ý dấu / đầu và cuối
  suffix: ".json",
});

// Hoặc sử dụng static loader cho SSR
getTranslateStaticModule({
  vi: require("../assets/i18n/vi.json"),
  en: require("../assets/i18n/en.json"),
});
```

### 4. Lỗi "Cannot inject APP_BASE_HREF"

**Nguyên nhân**: Chưa import getBaseProviders

**Giải pháp**:

```typescript
import { getBaseProviders } from "@cci-web/core";

bootstrapApplication(AppComponent, {
  providers: [
    ...getBaseProviders(), // ✅ Thêm dòng này
    provideCciWebCore(options),
  ],
});
```

### 5. Lỗi Environment không được inject

**Nguyên nhân**: Cấu hình environment không đúng format

**Giải pháp**:

```typescript
// ❌ Sai - thiếu properties bắt buộc
const environment = {
  production: false,
  // thiếu author, siteUrl, imageUrl, cdnUrl
};

// ✅ Đúng - đầy đủ properties
const environment: IEnvironment = {
  production: false,
  author: "CCI Team",
  siteUrl: "http://localhost:4200",
  imageUrl: "http://localhost:4200/assets/images",
  cdnUrl: "https://cdn.example.com",
};
```

### 9. Config Mapper Utils (`config-mapper.utils.ts`)

**Mô tả**: Utility functions để map và transform configuration data giữa các format khác nhau.

**Functions**:

```typescript
/**
 * Maps legacy app config to new IAppConfig format
 * @param legacyConfig - Legacy configuration object
 * @returns Mapped IAppConfig object
 */
export function mapLegacyToAppConfig(legacyConfig: ILegacyAppConfig): IAppConfig;

/**
 * Validates and normalizes configuration object
 * @param config - Configuration to validate
 * @returns Validated and normalized config
 */
export function validateAndNormalizeConfig<T>(config: Partial<T>): T;

/**
 * Merges multiple configuration objects with deep merge strategy
 * @param configs - Array of configuration objects to merge
 * @returns Merged configuration object
 */
export function mergeConfigs<T>(...configs: Partial<T>[]): T;

/**
 * Transforms environment-specific config values
 * @param config - Base configuration
 * @param environment - Target environment
 * @returns Environment-specific configuration
 */
export function transformForEnvironment<T>(config: T, environment: IEnvironment): T;
```

### 10. Types (`types.ts`)

**Mô tả**: Centralized type definitions và interfaces được sử dụng across providers.

**Core Types**:

```typescript
/**
 * Legacy app configuration interface for backward compatibility
 */
export interface ILegacyAppConfig {
  apiUrl?: string;
  appName?: string;
  version?: string;
  features?: Record<string, boolean>;
  [key: string]: any;
}

/**
 * Provider configuration options
 */
export interface IProviderOptions {
  /** Enable development mode features */
  developmentMode?: boolean;
  /** Custom validation rules */
  validationRules?: ValidationRule[];
  /** Error handling strategy */
  errorHandling?: "strict" | "lenient";
}

/**
 * Configuration factory function type
 */
export type ConfigFactory<T> = (environment: IEnvironment) => T | Promise<T>;

/**
 * Validation rule interface
 */
export interface ValidationRule {
  field: string;
  validator: (value: any) => boolean;
  message: string;
}

/**
 * Provider registration metadata
 */
export interface IProviderMetadata {
  name: string;
  version: string;
  dependencies?: string[];
  optional?: boolean;
}
```

**Utility Types**:

```typescript
/**
 * Deep partial type for configuration objects
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Configuration with environment overrides
 */
export type EnvironmentConfig<T> = T & {
  overrides?: {
    [env: string]: DeepPartial<T>;
  };
};

/**
 * Provider injection token type
 */
export type ProviderToken<T> = InjectionToken<T> | Type<T>;
```

## 📋 Examples và Usage Patterns

### 1. Basic App Setup

```typescript
// app.module.ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { provideCciWebCore } from "@cci-web/core";
import { environment } from "../environments/environment";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [
    ...provideCciWebCore({
      environment,
      appName: "My App",
      appConfig: {
        gatewayApi: {
          auth: "https://api.example.com/auth",
          users: "https://api.example.com/users",
        },
        userMessages: {
          welcome: "Welcome to our application!",
          goodbye: "Thank you for using our app!",
        },
        invalidMessages: {
          required: "This field is required",
          email: "Please enter a valid email",
        },
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### 2. Dynamic Config Loading

```typescript
// config.service.ts
import { Injectable, Inject } from "@angular/core";
import { APP_CONFIG, IAppConfig } from "@cci-web/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class ConfigService {
  constructor(@Inject(APP_CONFIG) private appConfig: IAppConfig, private http: HttpClient) {}

  loadRemoteConfig(): Observable<any> {
    return this.http.get(this.appConfig.gatewayApi.config);
  }

  getUserMessage(key: string): string {
    return this.appConfig.userMessages[key] || "Default message";
  }
}
```

### 3. Environment-Specific Configuration

```typescript
// environments/environment.prod.ts
export const environment: IEnvironment = {
  production: true,
  author: "CCI Team",
  siteUrl: "https://myapp.com",
  imageUrl: "https://cdn.myapp.com/images",
  cdnUrl: "https://cdn.myapp.com",
};

// environments/environment.ts
export const environment: IEnvironment = {
  production: false,
  author: "CCI Team",
  siteUrl: "http://localhost:4200",
  imageUrl: "http://localhost:4200/assets/images",
  cdnUrl: "http://localhost:4200/assets",
};
```

### 4. Custom Provider with Factory

```typescript
// custom-config.provider.ts
import { InjectionToken, Provider } from "@angular/core";
import { IEnvironment, IAppConfig } from "@cci-web/core";

export interface ICustomConfig {
  apiTimeout: number;
  retryAttempts: number;
  debugMode: boolean;
}

export const CUSTOM_CONFIG = new InjectionToken<ICustomConfig>("CUSTOM_CONFIG");

export function createCustomConfig(environment: IEnvironment, appConfig: IAppConfig): ICustomConfig {
  return {
    apiTimeout: environment.production ? 30000 : 10000,
    retryAttempts: environment.production ? 3 : 1,
    debugMode: !environment.production,
  };
}

export const CUSTOM_CONFIG_PROVIDER: Provider = {
  provide: CUSTOM_CONFIG,
  useFactory: createCustomConfig,
  deps: [ENVIRONMENT, APP_CONFIG],
};
```

### 5. Internationalization Setup

```typescript
// app.module.ts
import { NgModule } from "@angular/core";
import { getTranslateHttpModule } from "@cci-web/core";

@NgModule({
  imports: [
    // HTTP loader for translation files
    getTranslateHttpModule({
      prefix: "/assets/i18n/",
      suffix: ".json",
    }),

    // Or static loader for embedded translations
    getTranslateStaticModule({
      en: {
        HELLO: "Hello",
        WELCOME: "Welcome to our app",
      },
      vi: {
        HELLO: "Xin chào",
        WELCOME: "Chào mừng đến với ứng dụng",
      },
    }),
  ],
})
export class AppModule {}
```

### 6. Config Validation Example

```typescript
// config-validation.service.ts
import { Injectable } from "@angular/core";
import { ValidationRule, validateAndNormalizeConfig } from "@cci-web/core";

@Injectable({ providedIn: "root" })
export class ConfigValidationService {
  private validationRules: ValidationRule[] = [
    {
      field: "gatewayApi.auth",
      validator: (value: string) => value && value.startsWith("https://"),
      message: "Auth API must use HTTPS",
    },
    {
      field: "userMessages.welcome",
      validator: (value: string) => value && value.length > 0,
      message: "Welcome message cannot be empty",
    },
  ];

  validateConfig<T>(config: Partial<T>): T {
    return validateAndNormalizeConfig(config);
  }
}
```

### 7. Legacy Config Migration

```typescript
// migration.service.ts
import { Injectable } from "@angular/core";
import { mapLegacyToAppConfig, ILegacyAppConfig, IAppConfig } from "@cci-web/core";

@Injectable({ providedIn: "root" })
export class MigrationService {
  migrateLegacyConfig(legacyConfig: ILegacyAppConfig): IAppConfig {
    return mapLegacyToAppConfig(legacyConfig);
  }

  // Example legacy config
  private exampleLegacyConfig: ILegacyAppConfig = {
    apiUrl: "https://old-api.example.com",
    appName: "Legacy App",
    version: "1.0.0",
    features: {
      darkMode: true,
      notifications: false,
    },
  };
}
```

## 🎯 Best Practices

### 1. Tổ chức cấu hình theo môi trường

```typescript
// config/environment.dev.ts
export const devEnvironment: IEnvironment = {
  production: false,
  author: "CCI Team",
  siteUrl: "http://localhost:4200",
  imageUrl: "http://localhost:4200/assets/images",
  cdnUrl: "http://localhost:4200/assets",
};

// config/environment.prod.ts
export const prodEnvironment: IEnvironment = {
  production: true,
  author: "CCI Team",
  siteUrl: "https://ccistore.com",
  imageUrl: "https://images.ccistore.com",
  cdnUrl: "https://cdn.ccistore.com",
};

// main.ts
import { devEnvironment } from "./config/environment.dev";
// import { prodEnvironment } from './config/environment.prod';

const environment = devEnvironment; // Switch based on build
```

### 2. Validation cấu hình

```typescript
// config/config.validator.ts
export function validateCoreConfig(config: Partial<IAppConfig>): string[] {
  const errors: string[] = [];

  if (config.pageSize && (config.pageSize < 1 || config.pageSize > 100)) {
    errors.push("pageSize must be between 1 and 100");
  }

  if (config.defaultCacheTime && config.defaultCacheTime < 0) {
    errors.push("defaultCacheTime must be positive");
  }

  if (config.gatewayApi) {
    if (!config.gatewayApi.ecomApi) {
      errors.push("gatewayApi.ecomApi is required");
    }
    if (!config.gatewayApi.ecomV4Api) {
      errors.push("gatewayApi.ecomV4Api is required");
    }
  }

  return errors;
}

// Sử dụng
const configErrors = validateCoreConfig(appConfig);
if (configErrors.length > 0) {
  console.error("Configuration errors:", configErrors);
  throw new Error("Invalid configuration");
}
```

### 3. Type-safe configuration

```typescript
// config/app-config.type.ts
export interface AppConfigOptions {
  development: Partial<IAppConfig>;
  production: Partial<IAppConfig>;
  testing: Partial<IAppConfig>;
}

export const APP_CONFIGS: AppConfigOptions = {
  development: {
    pageSize: 10,
    defaultCacheTime: 60000, // 1 phút cho dev
    gatewayApi: {
      ecomApi: "http://localhost:5000/api/v1",
      ecomV4Api: "http://localhost:5000/api/v4",
    },
  },
  production: {
    pageSize: 50,
    defaultCacheTime: 600000, // 10 phút cho prod
    gatewayApi: {
      ecomApi: "https://api.ccistore.com/v1",
      ecomV4Api: "https://api.ccistore.com/v4",
    },
  },
  testing: {
    pageSize: 5,
    defaultCacheTime: 1000, // 1 giây cho test
    gatewayApi: {
      ecomApi: "http://localhost:3000/mock/v1",
      ecomV4Api: "http://localhost:3000/mock/v4",
    },
  },
};

// Sử dụng
const currentEnv = "development" as keyof AppConfigOptions;
const appConfig = APP_CONFIGS[currentEnv];
```

### 4. Lazy loading configuration

```typescript
// config/config.loader.ts
export async function loadAppConfig(): Promise<Partial<IAppConfig>> {
  try {
    const response = await fetch("/api/config");
    const serverConfig = await response.json();

    return {
      ...serverConfig,
      // Override với local config nếu cần
      pageSize: serverConfig.pageSize || 20,
    };
  } catch (error) {
    console.warn("Failed to load server config, using defaults");
    return {};
  }
}

// main.ts
import { loadAppConfig } from "./config/config.loader";

async function bootstrap() {
  const dynamicConfig = await loadAppConfig();

  bootstrapApplication(AppComponent, {
    providers: [
      provideCciWebCore({
        environment,
        appName: "CCI Store",
        appConfig: dynamicConfig,
      }),
    ],
  });
}

bootstrap().catch((err) => console.error(err));
```

## 📊 Performance Considerations

### 1. Provider Optimization

- Sử dụng `provideCciWebCore` thay vì import từng provider riêng lẻ
- Cấu hình cache time phù hợp với từng môi trường
- Sử dụng static translation loader cho SSR

### 2. Bundle Size

- Chỉ import các provider cần thiết
- Sử dụng tree-shaking để loại bỏ code không sử dụng
- Lazy load translation files

### 3. Memory Management

- Giới hạn maxCacheSize phù hợp
- Cleanup subscriptions trong services
- Sử dụng OnPush change detection strategy

---

_Tài liệu này được tạo cho @cci-web/core package. Để biết thêm thông tin, vui lòng tham khảo documentation chính của thư viện._
