## BREAKPOINTS_VALUE

**Mô tả**: Định nghĩa các media query breakpoint cho responsive design

**Cách sử dụng**:

```typescript
import { BREAKPOINTS_VALUE } from "@cci-web/core";

// Sử dụng trong CSS-in-JS hoặc Angular CDK Layout
const phoneQuery = BREAKPOINTS_VALUE.FOR_PHONE_ONLY; // "(max-width: 599px)"
const tabletQuery = BREAKPOINTS_VALUE.FOR_TABLET_PORTRAIT_UP; // "(min-width: 600px) and (max-width: 899px)"
```

**Ưu điểm**:

- Tập trung quản lý breakpoint
- Đảm bảo tính nhất quán trong toàn bộ ứng dụng
- Dễ dàng thay đổi và bảo trì

**Nhược điểm**:

- Cần import khi sử dụng
- Không thể thay đổi runtime

**Lưu ý**:

- Các breakpoint được thiết kế theo Mobile First approach
- Sử dụng kết hợp với BreakpointService để theo dõi thay đổi
