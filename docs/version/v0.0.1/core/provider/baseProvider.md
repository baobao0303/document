# Base Provider

## Tổng quan

`Base Provider` là một utility function cung cấp các provider cơ bản cho ứng dụng Angular, bao gồm:

- **Base URL configuration** cho routing
- **Global app configuration** từ window object
- **Safe environment handling** cho cả browser và SSR

## Tại sao cần Base Provider?

| **Không có Base Provider**      | **Có Base Provider**              |
| ------------------------------- | --------------------------------- |
| Phải tự setup routing từ đầu    | Routing tự động hoạt động         |
| Phải tự xử lý config            | Config được load tự động          |
| Có thể lỗi khi chạy trên server | Hoạt động tốt trên mọi môi trường |
| Phải viết nhiều code lặp lại    | Code ngắn gọn, dễ maintain        |

## Cách sử dụng

### Bước 1: Setup trong app.config.ts

```typescript
import { ApplicationConfig } from "@angular/core";
import { getBaseProviders } from "./core/providers/base.provider";

export const appConfig: ApplicationConfig = {
  providers: [
    ...getBaseProviders(), // ← Chỉ cần thêm dòng này
    // Các provider khác...
  ],
};
```

`getBaseProviders()` là một **function** trả về một mảng các provider cần thiết cho Angular app.

### Bên trong getBaseProviders() có gì?

```typescript
// Đây là những gì getBaseProviders() trả về
export function getBaseProviders(): Provider[] {
  return [
    {
      provide: APP_BASE_HREF, // ← Provider cho routing
      useFactory: getBaseUrl, // ← Function lấy base URL
    },
    {
      provide: CONFIG_APP, // ← Provider cho config
      useFactory: getConfigApp, // ← Function lấy config từ window
    },
  ];
}
```

**Giải thích đơn giản**: `getBaseProviders()` giống như một "hộp đồ nghề" chứa sẵn các provider cần thiết. Khi bạn dùng `...`, bạn "đổ" tất cả đồ trong hộp ra ngoài.

### Bước 2: Thêm config vào HTML

```html
<!-- Trong file index.html -->
<script>
  window.__CONFIG_APP__ = {
    apiUrl: "https://api.myapp.com",
    environment: "production",
    googleAnalyticsKey: "GA-123456",
  };
</script>
```

### Bước 3: Sử dụng trong component

```typescript
import { Component, Inject } from "@angular/core";
import { CONFIG_APP, AppConfig } from "./core/providers/base.provider";

@Component({
  selector: "app-root",
  template: `
    <div>
      <h1>API URL: {{ config.apiUrl }}</h1>
      <p>Environment: {{ config.environment }}</p>
    </div>
  `,
})
export class AppComponent {
  constructor(@Inject(CONFIG_APP) public config: AppConfig) {
    console.log("Config loaded:", config);
  }
}
```
