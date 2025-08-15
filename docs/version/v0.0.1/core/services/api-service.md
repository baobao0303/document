## ApiService

**Mô tả**: Wrapper service cho HTTP client với caching và responsive features

**Cách sử dụng**:

```typescript
import { ApiService } from '@cci-web/core';

// Inject trong constructor
constructor(private apiService: ApiService) {}

// GET với cache
this.apiService.get<Product[]>('/api/products', null, true)
  .subscribe(products => console.log(products));

// POST với form data
this.apiService.postFormData<any>('/api/upload', formData)
  .subscribe(result => console.log(result));
```

**Ưu điểm**:

- Built-in caching mechanism
- Responsive-aware (breakpoint integration)
- Support multiple content types
- Error handling
- UUID generation utility

**Nhược điểm**:

- Phụ thuộc nhiều dependencies
- Complex configuration
- Cache chỉ trong memory

**Lưu ý**:

- Tự động inject environment và app name
- Cache key generation tự động
- Hỗ trợ file upload với progress tracking
