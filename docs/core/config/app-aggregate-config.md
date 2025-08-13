# AppAggregateConfig

`AppAggregateConfig` là cấu hình tổng hợp cho ứng dụng, đóng vai trò như một điểm tập trung để quản lý tất cả các cấu hình cần thiết khi khởi động ứng dụng.

## Mục đích

- Gom nhóm các thông tin cấu hình (API, UI, Feature flags, v.v.).
- Giúp dễ dàng truyền cấu hình vào toàn bộ app thông qua dependency injection.
- Giảm việc hardcode và tăng tính tái sử dụng.

## Cách sử dụng

```ts
import { AppAggregateConfig } from "@cci-web/core";

export const appConfig: AppAggregateConfig = {
  apiBaseUrl: "https://api.example.com",
  enableFeatureX: true,
  theme: "light",
};
```

Sau đó có thể cung cấp qua `provideBaseAppProviders` hoặc các provider khác khi bootstrap app.

## Lợi ích

- Tập trung quản lý config ở một nơi.

- Dễ mở rộng khi cần thêm tham số mới.

- Giảm rủi ro cấu hình thiếu đồng bộ.
