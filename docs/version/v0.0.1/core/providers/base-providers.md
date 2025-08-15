## getBaseProviders

**Mô tả**: Function trả về các base providers cần thiết

**Cách sử dụng**:

```typescript
import { getBaseProviders } from "@cci-web/core";

// Trong app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    ...getBaseProviders(),
    // other providers
  ],
};
```

**Ưu điểm**:

- Tự động setup base href và config
- Xử lý SSR/browser differences
- Reusable across different apps

**Nhược điểm**:

- Black box, khó customize
- Dependency on global window object

**Lưu ý**:

- Tự động detect base URL từ DOM
- Inject global config từ window.**CONFIG_APP**
- Safe cho SSR environment
