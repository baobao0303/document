## CacheService

**Mô tả**: In-memory cache service với LRU eviction và TTL

**Cách sử dụng**:

```typescript
import { CacheService } from "@cci-web/core";

// Set cache với TTL custom
this.cacheService.set("user-123", userData, 60000); // 1 minute

// Get từ cache
const cachedData = this.cacheService.get("user-123");

// Generate cache key
const key = this.cacheService.generateKey("/api/users", { page: 1 });
```

**Ưu điểm**:

- LRU eviction strategy
- Configurable TTL và max size
- Automatic cleanup
- Key generation utility

**Nhược điểm**:

- Memory-only, mất khi refresh
- Không có persistence
- Single-threaded (không share across tabs)

**Lưu ý**:

- Config từ CCI_WEB_CORE_CONFIG
- Tự động update last access time
- Thread-safe operations
