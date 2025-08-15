## AppUserPrincipal

**Mô tả**: Class đại diện cho thông tin user đã đăng nhập

**Cách sử dụng**:

```typescript
import { AppUserPrincipal } from "@cci-web/core";

const user = new AppUserPrincipal({
  customer_id: 123,
  customer_uid: "uid-123",
  username: "john_doe",
  customer_name: "John Doe",
  avatar_url: "/avatar.jpg",
  gender: 1,
});
```

**Ưu điểm**:

- Constructor tự động map properties
- Type-safe với TypeScript
- Có thể extend thêm methods

**Nhược điểm**:

- Cần pass object vào constructor
- Không có validation
