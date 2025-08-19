# Providers Module - @cci-web/core

Tài liệu này giải thích ngắn gọn các provider trong `@cci-web/core`. Mục tiêu: ít code, dễ hiểu, áp dụng nhanh.

## Tóm tắt nhanh

| Provider/Token        | Khi dùng                                         | Cung cấp gì                                           |
| --------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| `provideCciWebCore()` | Khởi tạo core một lần ở bootstrap                | Toàn bộ providers cốt lõi (env, config, tên app…)     |
| `APP_CONFIG`          | Đọc cấu hình app ở services/components           | Cấu hình chung: `pageSize`, `gatewayApi`, `messages`… |
| `ENVIRONMENT`         | Cần thông tin môi trường (dev/prod, CDN, URL)    | Thông tin môi trường chạy ứng dụng                    |
| `getBaseProviders()`  | Cần `APP_BASE_HREF`, đọc `window.__CONFIG_APP__` | Base URL + config nền tảng, hỗ trợ SSR                |
| `APP_NAME`            | Hiển thị/ghi log tên ứng dụng                    | Tên ứng dụng                                          |
| `initializeAppConfig` | Chạy init sớm khi khởi động app                  | Hook `ApplicationConfig` để merge lúc bootstrap       |
| Translate (tuỳ chọn)  | Cần đa ngôn ngữ                                  | Tích hợp `ngx-translate` (HTTP/Static)                |

---

## Cấu hình nhanh (1 đoạn là đủ)

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { provideCciWebCore, getBaseProviders } from "@cci-web/core";

bootstrapApplication(AppComponent, {
  providers: [
    ...getBaseProviders(),
    provideCciWebCore({
      environment: {
        production: false,
        author: "CCI Team",
        siteUrl: "http://localhost:4200",
        imageUrl: "http://localhost:4200/assets/images",
        cdnUrl: "https://cdn.example.com",
      },
      appName: "CCI Store",
      appConfig: {
        pageSize: 20,
        defaultCacheTime: 300_000,
        gatewayApi: { ecomApi: "/api/v1", ecomV4Api: "/api/v4" },
        messages: { noData: "Không có dữ liệu" },
      },
    }),
  ],
});
```

Giải thích ngắn:

- `provideCciWebCore()` gom hết provider cần thiết → không phải tự đăng ký từng token.
- `getBaseProviders()` đọc `APP_BASE_HREF` và config nền tảng → URL tuyệt đối/SSR hoạt động đúng.

---

## Dùng thế nào? (ít code – rõ ý)

### Đọc cấu hình app

```typescript
import { inject } from "@angular/core";
import { APP_CONFIG } from "@cci-web/core";

const config = inject(APP_CONFIG);
http.get(`${config.gatewayApi.ecomApi}/products`);
```

### Đọc thông tin môi trường

```typescript
import { inject } from "@angular/core";
import { ENVIRONMENT } from "@cci-web/core";

const env = inject(ENVIRONMENT);
const imageBase = env.production ? env.cdnUrl : env.imageUrl;
```

### Tạo URL tuyệt đối từ base

```typescript
constructor(@Inject(APP_BASE_HREF) private baseHref: string) {}
getUrl(path: string) { return `${this.baseHref}${path}`; }
```

### Lấy tên ứng dụng

```typescript
import { inject } from "@angular/core";
import { APP_NAME } from "@cci-web/core";

const appName = inject(APP_NAME);
console.log(`Welcome to ${appName}`);
```

### Khởi tạo sớm khi bootstrap

```typescript
import { mergeApplicationConfig } from "@angular/core";
import { initializeAppConfig } from "@cci-web/core";

bootstrapApplication(AppComponent, mergeApplicationConfig(userCfg, initializeAppConfig));
```

### Thêm i18n (tuỳ chọn)

```typescript
import { importProvidersFrom } from "@angular/core";
import { getTranslateHttpModule } from "@cci-web/core";

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(getTranslateHttpModule({ prefix: "/assets/i18n/", suffix: ".json" }))],
});
```

---

## Lỗi thường gặp – sửa nhanh

| Thông báo/Lỗi                       | Nguyên nhân gọn                                         | Cách xử lý nhanh                            |
| ----------------------------------- | ------------------------------------------------------- | ------------------------------------------- |
| `No provider for APP_CONFIG`        | Thiếu `provideCciWebCore` hoặc không truyền `appConfig` | Thêm `provideCciWebCore({ appConfig: {} })` |
| Không đọc được `gatewayApi.ecomApi` | Thiếu field trong `appConfig.gatewayApi`                | Bổ sung `ecomApi`, `ecomV4Api`              |
| Không inject được `APP_BASE_HREF`   | Thiếu `getBaseProviders()`                              | Thêm `...getBaseProviders()`                |
| Ảnh/CDN sai khi build               | Tự gán URL thay vì lấy từ env                           | Lấy từ `ENVIRONMENT`                        |
| Translation không load              | Sai đường dẫn/lỗi file                                  | Kiểm tra prefix/suffix hoặc dùng Static     |

---

## Ghi nhớ nhanh

- Chỉ cần nhớ 2 hàm: `getBaseProviders()` và `provideCciWebCore({...})`.
- `appConfig.gatewayApi` là object mở: đặt tên key tuỳ ý (ví dụ `ecomApi`, `authApi`).
- Mặc định đã có sẵn; chỉ override phần cần thiết.
