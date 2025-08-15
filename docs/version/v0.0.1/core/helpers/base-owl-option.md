## baseOwlOption

**Mô tả**: Helper function tạo cấu hình responsive cho thư viện ngx-owl-carousel-o

**Cách sử dụng**:

```typescript
import { baseOwlOption } from "@cci-web/core";

const carouselOptions = baseOwlOption({
  items: { L: 1, XL: 2, XXL: 3 },
  loop: { L: true, XL: true, XXL: false },
  margin: { L: 10, XL: 15, XXL: 20 },
});
```

**Ưu điểm**:

- Cấu hình responsive tự động
- Giá trị mặc định hợp lý
- Tùy chỉnh linh hoạt theo từng breakpoint
- Hỗ trợ custom navigation text

**Nhược điểm**:

- Phụ thuộc vào thư viện ngx-owl-carousel-o
- Cấu trúc phức tạp cho người mới
- Chỉ hỗ trợ 3 breakpoint cố định (L, XL, XXL)

**Lưu ý**:

- Breakpoint mapping: L (0-599px), XL (600-899px), XXL (900px+)
- Tất cả options đều optional, sẽ merge với default values
- Navigation text mặc định sử dụng SVG icons
