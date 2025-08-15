## onDraggingToStopLink

**Mô tả**: Ngăn chặn việc click vào link khi user đang drag carousel

**Cách sử dụng**:

```typescript
import { onDraggingToStopLink } from "@cci-web/core";

const dragState = { isDragging: false, clearTimeEvent: null };

// Trong event handler của carousel
onDraggingToStopLink(isDragging, dragState, 300);

// Trong click handler của link
if (dragState.isDragging) {
  event.preventDefault();
  return false;
}
```

**Ưu điểm**:

- Cải thiện UX khi sử dụng carousel
- Tránh navigation không mong muốn
- Timeout có thể tùy chỉnh

**Nhược điểm**:

- Cần quản lý state manually
- Logic phức tạp cho người mới

**Lưu ý**:

- Default timeout là 300ms
- State object cần được maintain trong component
- Sử dụng kết hợp với carousel events
