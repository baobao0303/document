## fetchFederationManifest

**Mô tả**: Async function fetch remote federation manifest cho micro-frontend

**Cách sử dụng**:

```typescript
import { fetchFederationManifest } from "@cci-web/core";

try {
  const manifest = await fetchFederationManifest();
  console.log("Federation config:", manifest);
} catch (error) {
  console.error("Failed to load federation config:", error);
}
```

**Ưu điểm**:

- Universal (browser + Node.js)
- Promise-based API
- Error handling với descriptive messages
- Environment detection

**Nhược điểm**:

- Hardcoded URL từ ConfigValues
- Không có retry mechanism
- Không có timeout configuration

**Lưu ý**:

- Sử dụng fetch API
- Fallback cho Node.js environment
- URL từ ConfigValues.REMOTE_FEDERATION_CONFIG_URL
