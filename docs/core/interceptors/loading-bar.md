## loadingBarInterceptor

**Mô tả**: Interceptor theo dõi số lượng active requests để hiển thị loading state

**Cách sử dụng**:

```typescript
// Setup interceptor
import { loadingBarInterceptor } from "@cci-web/core";

// Trong component hoặc service
// Interceptor tự động log trạng thái, có thể integrate với loading service
```

**Ưu điểm**:

- Tự động tracking request lifecycle
- Hỗ trợ concurrent requests
- Logging chi tiết cho debugging
- Không cần manual setup cho từng request

**Nhược điểm**:

- Chỉ có logging, cần integrate thêm với UI loading component
- Memory overhead khi có nhiều concurrent requests

**Lưu ý**:

- Tracking theo request key (method + URL + params)
- Count số lượng duplicate requests
- Tự động cleanup khi requests complete
