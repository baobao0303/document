# Runtime Access

`Runtime Access` cho phép lấy thông tin cấu hình ngay tại thời điểm chạy (runtime), không phụ thuộc vào compile time.

## Khi nào nên dùng?

- Khi cấu hình được load từ server hoặc file JSON ngoài.
- Khi muốn thay đổi cấu hình mà không cần rebuild ứng dụng.

## Cách sử dụng

```ts
import { inject } from "@angular/core";
import { AppAggregateConfig } from "@cci-web/core";

export class MyService {
  private config = inject(AppAggregateConfig);

  getApiUrl(): string {
    return this.config.apiBaseUrl;
  }
}
```

## Ưu điểm

- Dễ dàng cập nhật config mà không ảnh hưởng đến bundle code.
- Giảm downtime khi thay đổi thông số quan trọng.
- Tăng tính linh hoạt cho hệ thống.
