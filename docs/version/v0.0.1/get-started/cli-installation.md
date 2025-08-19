# Cài đặt bằng CLI

Trang này minh hoạ việc dùng một CLI registry để cài component vào dự án của bạn. Bạn có hai lựa chọn:

## 1. Cài đặt một lần

Bạn có thể cài nhanh bằng một lệnh duy nhất. CLI sẽ hỏi đường dẫn cài đặt và có cài phụ thuộc hay không.

```bash
npx @react-bits/cli add button
```

### Các bước hỏi tương tác:

- **Installation path**: Chọn nơi sẽ cài component
- **Dependencies**: Tự động cài các gói cần thiết
- **TypeScript**: Tuỳ chọn sinh định nghĩa TypeScript

## 2. Cài đặt CLI toàn cục

Cài CLI toàn cục để sử dụng thuận tiện hơn:

```bash
npm install -g @react-bits/cli
```

Sau đó dùng để thêm component:

```bash
react-bits add button
react-bits add card
react-bits add modal
```

## 3. Khởi tạo dự án

Với dự án mới, bạn có thể khởi tạo kèm thiết lập cơ bản:

```bash
npx @react-bits/cli init my-project
cd my-project
npm install
```

Lệnh trên sẽ tạo:

- Cấu trúc dự án
- File cấu hình
- Các component cơ bản
- Dev dependencies

## 4. Duyệt danh sách component

Liệt kê tất cả component khả dụng:

```bash
react-bits list
```

Tìm theo từ khoá hoặc chuyên mục:

```bash
react-bits search button
react-bits search --category navigation
react-bits search --tag responsive
```

## 5. Cập nhật component

Giữ các component luôn mới nhất:

```bash
react-bits update button
react-bits update --all
```

## 6. Cấu hình CLI

Tuỳ biến hành vi CLI qua file cấu hình:

```json
{
  "installPath": "./src/components",
  "typescript": true,
  "cssFramework": "tailwind",
  "autoInstallDeps": true
}
```

## Tham khảo lệnh CLI

| Lệnh     | Mô tả                     | Ví dụ                      |
| -------- | ------------------------- | -------------------------- |
| `add`    | Cài một component         | `react-bits add button`    |
| `list`   | Hiển thị tất cả component | `react-bits list`          |
| `search` | Tìm component             | `react-bits search modal`  |
| `update` | Cập nhật component        | `react-bits update --all`  |
| `init`   | Khởi tạo dự án            | `react-bits init my-app`   |
| `config` | Quản lý thiết lập         | `react-bits config --show` |

## Hoàn tất!

CLI giúp bạn quản lý component rất dễ dàng trong dự án. Không còn copy-paste – chỉ cần cài và dùng!
