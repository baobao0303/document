## duplicateRequestInterceptor

**Mô tả**: Interceptor ngăn chặn việc gửi duplicate GET requests đồng thời

**Cách sử dụng**:

```typescript
// Trong app.config.ts hoặc providers
import { duplicateRequestInterceptor } from "@cci-web/core";

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([duplicateRequestInterceptor]))],
};
```

**Ưu điểm**:

- Giảm tải server bằng cách tránh duplicate requests
- Tự động share response cho các requests giống nhau
- Không cần thay đổi code existing
- Logging để debug

**Nhược điểm**:

- Chỉ áp dụng cho GET requests
- Cache trong memory, mất khi refresh page
- Có thể gây confusion khi debug

**Lưu ý**:

- Cache key được tạo từ method + URL + params
- Tự động clear cache khi request complete hoặc error
- Chỉ hoạt động trong cùng một session
