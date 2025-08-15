# Cài đặt và tích hợp vào dự án

## Yêu cầu hệ thống

- Angular 15+
- Node.js 16+
- TypeScript 4.8+

## Cài đặt

### Bước 1: Cài đặt dependencies

```bash
npm install @angular/core @angular/common @angular/router
npm install @angular/platform-browser @angular/platform-server
npm install rxjs
```

### Bước 2: Cấu hình TypeScript paths

Trong `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["projects/cci-web/core/src/lib/*"],
      "@shared/*": ["projects/cci-web/shared/src/lib/*"],
      "@server/*": ["projects/cci-web/server/src/lib/*"]
    }
  }
}
```

### Bước 3: Import modules trong ứng dụng

```typescript
// app.config.ts
import { provideCciWebCore } from "@core/providers";
import { provideSharedCore } from "@shared/providers";

export const appConfig: ApplicationConfig = {
  providers: [
    // Core providers
    provideCciWebCore({
      appName: "your-app-name",
      cache: {
        defaultTtl: 300000, // 5 phút
        maxItems: 100,
      },
      gatewayApi: {
        ecomApi: "",
        ecomV4Api: "",
      },
    }),

    // Shared providers
    provideSharedCore(),

    // Các providers khác...
  ],
};
```

## Custom Configuration cho môi trường khác nhau

### Production Environment

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: "https://api.production.com",
  apiV4Url: "https://api-v4.production.com",
  cacheConfig: {
    defaultTtl: 600000, // 10 phút cho production
    maxItems: 200,
  },
};
```

### Development Environment

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  apiV4Url: "http://localhost:3000/api/v4",
  cacheConfig: {
    defaultTtl: 60000, // 1 phút cho development
    maxItems: 50,
  },
};
```

### App Configuration

```typescript
// app.config.ts
import { environment } from "../environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    provideCciWebCore({
      appName: "my-app",
      cache: environment.cacheConfig,
      gatewayApi: {
        ecomApi: environment.apiUrl,
        ecomV4Api: environment.apiV4Url,
      },
      messages: {
        validation: {
          required: "Trường này là bắt buộc",
          email: "Email không hợp lệ",
          minLength: "Độ dài tối thiểu là {0} ký tự",
        },
      },
    }),
  ],
};
```