### SeoSocialShareData

**Mô tả**: Interface cho SEO metadata và social sharing

**Cách sử dụng**:

```typescript
import { SeoSocialShareData } from "@cci-web/core";

const seoData: SeoSocialShareData = {
  title: "Product Name",
  description: "Product description",
  image: "/product-image.jpg",
  url: "https://example.com/product/123",
  type: "product",
  author: "CCI Team",
};
```

**Ưu điểm**:

- Comprehensive SEO fields
- Optional properties cho flexibility
- Hỗ trợ Open Graph và Twitter Cards

**Nhược điểm**:

- Không có validation cho URL formats
- Thiếu structured data fields
