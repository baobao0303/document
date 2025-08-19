# Cài đặt thủ công

Làm theo các bước sau để cài đặt component thủ công:

## 1. Chọn component

Xem trước các component và chọn cái bạn muốn, sau đó chuyển sang tab Code để lấy mã nguồn.

## 2. Cài đặt phụ thuộc

Một số component sử dụng thư viện bên ngoài, đừng quên cài đặt chúng. Ví dụ, component SplitText cần GSAP để chạy animation mượt mà.

```bash
npm install gsap
```

## 3. Sao chép mã

Tab Code chứa toàn bộ mã bạn cần sao chép – bạn có thể dùng các nút trên tab để chuyển giữa các công nghệ khi cần.

## 4. Sử dụng component

Mỗi component đều có ví dụ sử dụng cơ bản; nếu muốn đi sâu hơn, bạn có thể xem toàn bộ props trên tab Preview.

```javascript
import SplitText from "./SplitText";

<SplitText text="Hello, you!" delay={100} duration={0.6} />;
```

## 5. Tuỳ chỉnh kiểu dáng (CSS)

Chỉnh sửa CSS của component để phù hợp với hệ thống thiết kế của bạn:

```css
.split-text {
  font-family: "Your Font", sans-serif;
  color: #your-color;
  font-size: 2rem;
}
```

## 6. Kiểm thử tích hợp

Hãy kiểm thử component trong nhiều bối cảnh khác nhau:

- Nhiều kích thước màn hình
- Độ dài nội dung khác nhau
- Trường hợp biên và trạng thái lỗi

## Hoàn tất!

Từ đây, tất cả phụ thuộc vào cách bạn tích hợp component vào dự án. Bạn có toàn quyền thay đổi mã – chỉnh style, tính năng… tuỳ ý!
