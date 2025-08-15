#### CCI_WEB_APP_NAME

**Mô tả**: Injection token để inject tên ứng dụng

**Cách sử dụng**:

```typescript
import { CCI_WEB_APP_NAME } from '@cci-web/core';

// Trong providers
{ provide: CCI_WEB_APP_NAME, useValue: 'My App' }

// Trong service/component
constructor(@Inject(CCI_WEB_APP_NAME) private appName: string) {}
```

**Ưu điểm**:

- Type-safe injection
- Centralized app name management
- Easy to change across app

**Nhược điểm**:

- Cần setup trong providers
- Thêm complexity cho simple value
