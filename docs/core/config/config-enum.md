## ConfigValues

**Mô tả**: Enum chứa các URL và giá trị cấu hình quan trọng

**Cách sử dụng**:

```typescript
import { ConfigValues } from "@cci-web/core";

const federationUrl = ConfigValues.REMOTE_FEDERATION_CONFIG_URL;
```

**Ưu điểm**:

- Type-safe với TypeScript
- Tập trung quản lý cấu hình
- IntelliSense support

**Nhược điểm**:

- Giá trị cố định, không thể thay đổi runtime
- Cần rebuild khi thay đổi
