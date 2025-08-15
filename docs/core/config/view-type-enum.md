#### ViewType

**Mô tả**: Enum định nghĩa các loại view trong ứng dụng

**Cách sử dụng**:

```typescript
import { ViewType } from "@cci-web/core";

if (currentView === ViewType.MOBILE) {
  // Logic cho mobile
} else if (currentView === ViewType.DESKTOP) {
  // Logic cho desktop
}
```

**Ưu điểm**:

- Type-safe
- Dễ đọc và hiểu
- Tránh magic string

**Nhược điểm**:

- Chỉ hỗ trợ 2 loại view cơ bản
- Cần mở rộng nếu có thêm loại view
