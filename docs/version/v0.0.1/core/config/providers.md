# Providers Module - @cci-web/core

Module này chứa các provider cấu hình và khởi tạo cho thư viện CCI-Web Core. Các provider này giúp thiết lập dependency injection, cấu hình ứng dụng và quản lý các service cần thiết.

## 📋 Danh sách Providers

### 1. App Provider (`app.provider.ts`)
**Mô tả**: Provider chính để cấu hình toàn bộ thư viện CCI-Web Core.

**Interface**:
```typescript
export interface IProvideCciWebCoreOptions {
  environment: any;           // Cấu hình môi trường
  appName: string;           // Tên ứng dụng
  appConfig: Partial<IAppConfig>; // Cấu hình ứng dụng
}

export function provideCciWebCore(options: IProvideCciWebCoreOptions): Provider[]
```

**Chức năng**:
- Tổng hợp tất cả provider cần thiết
- Cấu hình environment token
- Thiết lập app name token
- Khởi tạo core config

**Cách sử dụng**:
```typescript
import { provideCciWebCore } from '@cci-web/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// Cấu hình cơ bản
const coreOptions = {
  environment: {
    production: false,
    author: 'CCI Team',
    siteUrl: 'https://ccistore.com',
    imageUrl: 'https://images.ccistore.com',
    cdnUrl: 'https://cdn.ccistore.com'
  },
  appName: 'CCI-Store',
  appConfig: {
    pageSize: 20,
    defaultCacheTime: 300000, // 5 phút
    gatewayApi: {
      ecomApi: 'https://api.ccistore.com/v1',
      ecomV4Api: 'https://api.ccistore.com/v4'
    }
  }
};

bootstrapApplication(AppComponent, {
  providers: [
    provideCciWebCore(coreOptions),
    // ... other providers
  ]
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
  appName: string;
  defaultCacheTime: number;
  maxCacheSize: number;
  pageSize: number;
  gatewayApi: {
    ecomApi: string;
    ecomV4Api: string;
  };
  messages: {
    getValidateForm: string;
    noData: string;
    addToCartError: string;
  };
  invalidMessages: {
    email: string;
    number: string;
    positiveNumber: string;
    positiveInteger: string;
  };
  otpTimer: number;
  phoneRegex: RegExp;
  defaultPlaceholderInputSearch: string;
  specialCharPatternSearch: RegExp;
  viewedAllContent: string;
}

export const APP_CONFIG = new InjectionToken<IAppConfig>('APP_CONFIG');
export const DEFAULT_APP_CONFIG: IAppConfig;
```

**Cách sử dụng**:
```typescript
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG, IAppConfig } from '@cci-web/core';

@Injectable()
export class ProductService {
  private config = inject(APP_CONFIG);

  getProducts(page: number = 1) {
    const pageSize = this.config.pageSize;
    const apiUrl = this.config.gatewayApi.ecomApi;
    
    return this.http.get(`${apiUrl}/products`, {
      params: { page: page.toString(), size: pageSize.toString() }
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
  appName: 'default',
  defaultCacheTime: 300000, // 5 phút
  maxCacheSize: 100,
  pageSize: 10,
  gatewayApi: {
    ecomApi: '',
    ecomV4Api: ''
  },
  messages: {
    getValidateForm: 'Vui lòng nhập đủ các thông tin bắt buộc (*)',
    noData: 'Không có dữ liệu',
    addToCartError: 'Thêm sản phẩm KHÔNG thành công.'
  },
  invalidMessages: {
    email: 'Vui lòng nhập nhập email',
    number: 'Vui lòng nhập nhập số',
    positiveNumber: 'Vui lòng nhập số dương',
    positiveInteger: 'Vui lòng nhập số nguyên dương'
  },
  otpTimer: 60,
  phoneRegex: /^(0[3|5|7|8|9][0-9]{8}|0[1-9][0-9]{9})$/,
  defaultPlaceholderInputSearch: 'Ba mẹ muốn tìm mua gì hôm nay?',
  specialCharPatternSearch: /[!@#$%\^&\*\(\),\.\?":\{\}\|<>]/g,
  viewedAllContent: 'Ba / mẹ đã xem hết nội dung rồi'
};
```

### 3. Config Provider (`config.provider.ts`)
**Mô tả**: Factory functions để tạo và quản lý config providers.

**Functions**:
```typescript
export function provideCciWebCoreConfig(config: Partial<IAppConfig>): Provider
export function createCciWebCoreConfigFromAppConfig(appConfig: any): IAppConfig
```

**Cách sử dụng**:
```typescript
import { provideCciWebCoreConfig, createCciWebCoreConfigFromAppConfig } from '@cci-web/core';

// Cách 1: Sử dụng trực tiếp
const customConfig = {
  pageSize: 25,
  defaultCacheTime: 600000, // 10 phút
  messages: {
    noData: 'Không tìm thấy dữ liệu nào'
  }
};

const configProvider = provideCciWebCoreConfig(customConfig);

// Cách 2: Convert từ app config hiện tại
const existingAppConfig = {
  APP_NAME: 'My Store',
  PAGE_SIZE: 30,
  ECOM_API: 'https://api.mystore.com',
  NO_DATA: 'No data found'
};

const convertedConfig = createCciWebCoreConfigFromAppConfig(existingAppConfig);
const provider = provideCciWebCoreConfig(convertedConfig);
```

**Ưu điểm**:
- ✅ Hỗ trợ migration từ config cũ
- ✅ Flexible configuration
- ✅ Type-safe merging

### 4. Environment Provider (`environment.provider.ts`)
**Mô tả**: Provider cho environment configuration.

**Interface**:
```typescript
export interface IEnvironment {
  production: boolean;
  author: string;
  siteUrl: string;
  imageUrl: string;
  cdnUrl: string;
}

export const ENVIRONMENT = new InjectionToken<IEnvironment>('ENVIRONMENT');
```

**Cách sử dụng**:
```typescript
import { inject, Injectable } from '@angular/core';
import { ENVIRONMENT, IEnvironment } from '@cci-web/core';

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
  selector: 'app-product-image',
  template: `
    <img [src]="getImageUrl(product.image)" 
         [alt]="product.name"
         class="product-image">
  `
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
function getBaseUrl(): string
function getConfigApp(): Record<string, unknown>
export function getBaseProviders(): Provider[]
```

**Cách sử dụng**:
```typescript
import { getBaseProviders } from '@cci-web/core';
import { bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
  providers: [
    ...getBaseProviders(),
    // ... other providers
  ]
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
export const APP_NAME = new InjectionToken<string>('APP_NAME');
```

**Cách sử dụng**:
```typescript
import { inject, Injectable } from '@angular/core';
import { APP_NAME } from '@cci-web/core';

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
export const initializeApplication: (appInitialize: AppInitializeService) => (() => Observable<boolean>)
export const initializeAppConfig: ApplicationConfig
```

**Cách sử dụng**:
```typescript
import { initializeAppConfig } from '@cci-web/core';
import { mergeApplicationConfig } from '@angular/core';

const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
  ]
};

// Merge với initializer config
const finalConfig = mergeApplicationConfig(appConfig, initializeAppConfig);

bootstrapApplication(AppComponent, finalConfig);
```

### 8. Translate Provider (`translate.provider.ts`)
**Mô tả**: Provider cho internationalization (i18n) sử dụng ngx-translate.

**Functions**:
```typescript
export function getTranslateHttpModule(options?: {
  prefix?: string;
  suffix?: string;
}): ModuleWithProviders<TranslateModule>

export function getTranslateStaticModule(resources: Record<string, any>): ModuleWithProviders<TranslateModule>
```

**Cách sử dụng**:

**1. HTTP-based translation (Browser)**:
```typescript
import { getTranslateHttpModule } from '@cci-web/core';

@NgModule({
  imports: [
    getTranslateHttpModule({
      prefix: '/assets/i18n/',
      suffix: '.json'
    })
  ]
})
export class AppModule {}

// Hoặc với standalone components
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      getTranslateHttpModule({
        prefix: '/assets/i18n/',
        suffix: '.json'
      })
    )
  ]
});
```

**2. Static translation (SSR)**:
```typescript
import { getTranslateStaticModule } from '@cci-web/core';

const translations = {
  'vi': {
    'HELLO': 'Xin chào',
    'WELCOME': 'Chào mừng bạn đến với {{appName}}'
  },
  'en': {
    'HELLO': 'Hello',
    'WELCOME': 'Welcome to {{appName}}'
  }
};

@NgModule({
  imports: [
    getTranslateStaticModule(translations)
  ]
})
export class AppServerModule {}
```

**3. Sử dụng trong component**:
```typescript
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-welcome',
  template: `
    <h1>{{ 'HELLO' | translate }}</h1>
    <p>{{ 'WELCOME' | translate: {appName: appName} }}</p>
    <button (click)="switchLanguage('vi')">Tiếng Việt</button>
    <button (click)="switchLanguage('en')">English</button>
  `
})
export class WelcomeComponent {
  appName = 'CCI Store';

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('vi');
    translate.use('vi');
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
import { bootstrapApplication } from '@angular/platform-browser';
import { provideCciWebCore, getBaseProviders } from '@cci-web/core';
import { AppComponent } from './app/app.component';

const environment = {
  production: false,
  author: 'CCI Team',
  siteUrl: 'http://localhost:4200',
  imageUrl: 'http://localhost:4200/assets/images',
  cdnUrl: 'https://cdn.ccistore.com'
};

const appConfig = {
  pageSize: 20,
  defaultCacheTime: 300000,
  gatewayApi: {
    ecomApi: 'http://localhost:5000/api/v1',
    ecomV4Api: 'http://localhost:5000/api/v4'
  },
  messages: {
    noData: 'Không có dữ liệu để hiển thị'
  }
};

bootstrapApplication(AppComponent, {
  providers: [
    ...getBaseProviders(),
    provideCciWebCore({
      environment,
      appName: 'CCI Store Development',
      appConfig
    })
  ]
});
```

### Cấu hình cho Production
```typescript
// main.prod.ts
const productionEnvironment = {
  production: true,
  author: 'CCI Team',
  siteUrl: 'https://ccistore.com',
  imageUrl: 'https://images.ccistore.com',
  cdnUrl: 'https://cdn.ccistore.com'
};

const productionConfig = {
  pageSize: 50,
  defaultCacheTime: 600000, // 10 phút
  maxCacheSize: 500,
  gatewayApi: {
    ecomApi: 'https://api.ccistore.com/v1',
    ecomV4Api: 'https://api.ccistore.com/v4'
  }
};

bootstrapApplication(AppComponent, {
  providers: [
    ...getBaseProviders(),
    provideCciWebCore({
      environment: productionEnvironment,
      appName: 'CCI Store',
      appConfig: productionConfig
    })
  ]
});
```

### Cấu hình với Translation
```typescript
import { importProvidersFrom } from '@angular/core';
import { getTranslateHttpModule } from '@cci-web/core';

bootstrapApplication(AppComponent, {
  providers: [
    ...getBaseProviders(),
    provideCciWebCore({
      environment,
      appName: 'CCI Store',
      appConfig
    }),
    importProvidersFrom(
      getTranslateHttpModule({
        prefix: '/assets/i18n/',
        suffix: '.json'
      })
    )
  ]
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
  appName: 'My App'
  // thiếu appConfig
});

// ✅ Đúng
provideCciWebCore({
  environment,
  appName: 'My App',
  appConfig: {} // ít nhất là object rỗng
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
  prefix: '/assets/i18n/',  // Chú ý dấu / đầu và cuối
  suffix: '.json'
})

// Hoặc sử dụng static loader cho SSR
getTranslateStaticModule({
  'vi': require('../assets/i18n/vi.json'),
  'en': require('../assets/i18n/en.json')
})
```

### 4. Lỗi "Cannot inject APP_BASE_HREF"

**Nguyên nhân**: Chưa import getBaseProviders

**Giải pháp**:
```typescript
import { getBaseProviders } from '@cci-web/core';

bootstrapApplication(AppComponent, {
  providers: [
    ...getBaseProviders(), // ✅ Thêm dòng này
    provideCciWebCore(options)
  ]
});
```

### 5. Lỗi Environment không được inject

**Nguyên nhân**: Cấu hình environment không đúng format

**Giải pháp**:
```typescript
// ❌ Sai - thiếu properties bắt buộc
const environment = {
  production: false
  // thiếu author, siteUrl, imageUrl, cdnUrl
};

// ✅ Đúng - đầy đủ properties
const environment: IEnvironment = {
  production: false,
  author: 'CCI Team',
  siteUrl: 'http://localhost:4200',
  imageUrl: 'http://localhost:4200/assets/images',
  cdnUrl: 'https://cdn.example.com'
};
```

## 🎯 Best Practices

### 1. Tổ chức cấu hình theo môi trường
```typescript
// config/environment.dev.ts
export const devEnvironment: IEnvironment = {
  production: false,
  author: 'CCI Team',
  siteUrl: 'http://localhost:4200',
  imageUrl: 'http://localhost:4200/assets/images',
  cdnUrl: 'http://localhost:4200/assets'
};

// config/environment.prod.ts
export const prodEnvironment: IEnvironment = {
  production: true,
  author: 'CCI Team',
  siteUrl: 'https://ccistore.com',
  imageUrl: 'https://images.ccistore.com',
  cdnUrl: 'https://cdn.ccistore.com'
};

// main.ts
import { devEnvironment } from './config/environment.dev';
// import { prodEnvironment } from './config/environment.prod';

const environment = devEnvironment; // Switch based on build
```

### 2. Validation cấu hình
```typescript
// config/config.validator.ts
export function validateCoreConfig(config: Partial<IAppConfig>): string[] {
  const errors: string[] = [];
  
  if (config.pageSize && (config.pageSize < 1 || config.pageSize > 100)) {
    errors.push('pageSize must be between 1 and 100');
  }
  
  if (config.defaultCacheTime && config.defaultCacheTime < 0) {
    errors.push('defaultCacheTime must be positive');
  }
  
  if (config.gatewayApi) {
    if (!config.gatewayApi.ecomApi) {
      errors.push('gatewayApi.ecomApi is required');
    }
    if (!config.gatewayApi.ecomV4Api) {
      errors.push('gatewayApi.ecomV4Api is required');
    }
  }
  
  return errors;
}

// Sử dụng
const configErrors = validateCoreConfig(appConfig);
if (configErrors.length > 0) {
  console.error('Configuration errors:', configErrors);
  throw new Error('Invalid configuration');
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
      ecomApi: 'http://localhost:5000/api/v1',
      ecomV4Api: 'http://localhost:5000/api/v4'
    }
  },
  production: {
    pageSize: 50,
    defaultCacheTime: 600000, // 10 phút cho prod
    gatewayApi: {
      ecomApi: 'https://api.ccistore.com/v1',
      ecomV4Api: 'https://api.ccistore.com/v4'
    }
  },
  testing: {
    pageSize: 5,
    defaultCacheTime: 1000, // 1 giây cho test
    gatewayApi: {
      ecomApi: 'http://localhost:3000/mock/v1',
      ecomV4Api: 'http://localhost:3000/mock/v4'
    }
  }
};

// Sử dụng
const currentEnv = 'development' as keyof AppConfigOptions;
const appConfig = APP_CONFIGS[currentEnv];
```

### 4. Lazy loading configuration
```typescript
// config/config.loader.ts
export async function loadAppConfig(): Promise<Partial<IAppConfig>> {
  try {
    const response = await fetch('/api/config');
    const serverConfig = await response.json();
    
    return {
      ...serverConfig,
      // Override với local config nếu cần
      pageSize: serverConfig.pageSize || 20
    };
  } catch (error) {
    console.warn('Failed to load server config, using defaults');
    return {};
  }
}

// main.ts
import { loadAppConfig } from './config/config.loader';

async function bootstrap() {
  const dynamicConfig = await loadAppConfig();
  
  bootstrapApplication(AppComponent, {
    providers: [
      provideCciWebCore({
        environment,
        appName: 'CCI Store',
        appConfig: dynamicConfig
      })
    ]
  });
}

bootstrap().catch(err => console.error(err));
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

*Tài liệu này được tạo cho @cci-web/core package. Để biết thêm thông tin, vui lòng tham khảo documentation chính của thư viện.*