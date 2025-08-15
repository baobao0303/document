## PagingConfig & PagingResponse\<T\>

**Mô tả**: Interfaces cho pagination functionality

**Cách sử dụng**:

```typescript
import { PagingConfig, PagingResponse } from "@cci-web/core";

// Config cho request
const pagingConfig: PagingConfig = {
  TotalRecord: 0,
  CurrentPageIndex: 1,
  PageIndex: 1,
  PageSize: 10,
};

// Response từ API
const response: PagingResponse<Product> = {
  StatusCode: 200,
  ErrorMessage: "",
  TotalRecord: 100,
  CurrentPageIndex: 1,
  PageSize: 10,
  Records: [products],
};
```

**Ưu điểm**:

- Chuẩn hóa pagination across app
- Generic type cho flexibility
- Bao gồm error handling

**Nhược điểm**:

- Naming convention không consistent (PascalCase)
- Thiếu total pages calculation
