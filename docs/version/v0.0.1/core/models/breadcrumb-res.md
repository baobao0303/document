## BreadcrumbRes

**Mô tả**: Interface định nghĩa cấu trúc breadcrumb navigation

**Cách sử dụng**:

```typescript
import { BreadcrumbRes } from "@cci-web/core";

const breadcrumbs: BreadcrumbRes[] = [
  { title: "Home", link: "/" },
  { title: "Products", link: "/products" },
  { title: "Detail", link: "/products/123" },
];
```

**Ưu điểm**:

- Cấu trúc đơn giản, dễ hiểu
- Flexible cho nhiều loại navigation

**Nhược điểm**:

- Không có validation cho URL format
- Thiếu metadata như icon, active state
