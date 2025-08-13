# RequestCacheService

`RequestCacheService` giúp lưu trữ và tái sử dụng kết quả API để giảm số lượng request.

## Mục đích

- Tăng hiệu suất tải trang.
- Giảm tải cho server.
- Tránh gọi API lặp lại trong thời gian ngắn.

## Ví dụ

```ts
import { RequestCacheService } from '@cci-web/core';

constructor(private cache: RequestCacheService, private api: ApiService) {}

getCategory(id: string) {
  const key = this.cache.generateKey('/api/categories', id);
  return this.cache.get(key, () => this.api.get(`/api/categories/${id}`), 5 * 60_000);
}
```

## Hỗ trợ

- Thống kê hit/miss, clear theo key hoặc toàn bộ, TTL từng entry, chống đua bằng `pendingRequests`.

## Tại sao dùng `RequestCacheService` thay vì tự cài đặt?

- Giảm code trùng cho pattern phổ biến: key -> Observable + TTL + pending dedupe.
- Cung cấp số liệu hit/miss phục vụ tuning hiệu năng.
- Có dọn dẹp định kỳ entry hết hạn, tránh memory leak ở SPA sống lâu.

## Lợi ích

- Tối ưu hiệu suất ứng dụng.

- Giảm độ trễ hiển thị dữ liệu.

- Tăng trải nghiệm người dùng.
